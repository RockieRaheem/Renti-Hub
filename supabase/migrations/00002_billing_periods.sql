-- =========================================================================
-- RentiHub — Billing Periods & Payment Allocations
-- =========================================================================
-- Adds professional month-by-month billing with payment allocation waterfall.
-- Run alongside 00001_schema.sql.
-- =========================================================================

-- 1. Billing Periods — one row per tenant per month
create table if not exists public.billing_periods (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  period_start date not null,
  period_end   date not null,
  rent_due     numeric(12,2) not null default 0,
  status       text not null default 'unpaid'
               check (status in ('unpaid','partial','paid','credited','waived')),
  created_at   timestamptz not null default now()
);
alter table public.billing_periods enable row level security;

create policy "Billing periods inherit building access"
  on public.billing_periods for all
  using (exists (
    select 1 from public.tenants
    join public.buildings on buildings.id = tenants.building_id
    where tenants.id = billing_periods.tenant_id
    and buildings.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.tenants
    join public.buildings on buildings.id = tenants.building_id
    where tenants.id = billing_periods.tenant_id
    and buildings.user_id = auth.uid()
  ));

create index if not exists idx_billing_periods_tenant
  on public.billing_periods(tenant_id);
create index if not exists idx_billing_periods_status
  on public.billing_periods(tenant_id, status);

-- 2. Payment Allocations — links payments to specific billing periods
create table if not exists public.payment_allocations (
  id          uuid primary key default gen_random_uuid(),
  payment_id  uuid not null references public.payments(id) on delete cascade,
  period_id   uuid not null references public.billing_periods(id) on delete cascade,
  amount      numeric(12,2) not null,
  created_at  timestamptz not null default now()
);
alter table public.payment_allocations enable row level security;

create policy "Payment allocations inherit building access"
  on public.payment_allocations for all
  using (exists (
    select 1 from public.payments
    join public.buildings on buildings.id = payments.building_id
    where payments.id = payment_allocations.payment_id
    and buildings.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.payments
    join public.buildings on buildings.id = payments.building_id
    where payments.id = payment_allocations.payment_id
    and buildings.user_id = auth.uid()
  ));

create index if not exists idx_payment_allocations_payment
  on public.payment_allocations(payment_id);
create index if not exists idx_payment_allocations_period
  on public.payment_allocations(period_id);

-- 3. Tenant balance computed from periods and allocations
create or replace function public.compute_tenant_balance(p_tenant_id uuid)
returns numeric as $$
declare
  total_due numeric;
  total_paid numeric;
begin
  select coalesce(sum(rent_due), 0) into total_due
  from public.billing_periods
  where tenant_id = p_tenant_id;

  select coalesce(sum(pa.amount), 0) into total_paid
  from public.payment_allocations pa
  join public.billing_periods bp on bp.id = pa.period_id
  where bp.tenant_id = p_tenant_id;

  return total_due - total_paid;
end;
$$ language plpgsql security definer stable;

-- 4. Helper: get monthly rent for a tenant from their unit
create or replace function public.get_tenant_monthly_rent(p_tenant_id uuid)
returns numeric as $$
declare
  rent numeric;
begin
  select coalesce(u.monthly_rent, 0) into rent
  from public.tenants t
  join public.units u on u.id = t.unit_id
  where t.id = p_tenant_id;
  return rent;
end;
$$ language plpgsql security definer stable;

-- 5. Trigger: auto-create billing period on tenant insert, sync cached balance
create or replace function public.create_initial_billing_period()
returns trigger as $$
declare
  month_start date;
  month_end   date;
  rent        numeric;
begin
  month_start := date_trunc('month', now())::date;
  month_end   := (date_trunc('month', now()) + interval '1 month - 1 day')::date;
  rent        := public.get_tenant_monthly_rent(new.id);

  insert into public.billing_periods (tenant_id, period_start, period_end, rent_due, status)
  values (new.id, month_start, month_end, rent, 'unpaid');

  -- Keep the tenant's cached balance in sync so all UI reads are consistent
  update public.tenants
  set outstanding_balance = rent,
      paid = (rent <= 0)
  where id = new.id;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_tenant_create_billing_period
  after insert on public.tenants
  for each row execute function public.create_initial_billing_period();
