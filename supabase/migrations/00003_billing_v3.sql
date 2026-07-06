-- =========================================================================
-- RentiHub — Billing V3: Integrity + Accuracy
-- =========================================================================
-- Adds unique constraint, cache sync function, improved trigger.
-- Run AFTER 00001_schema.sql and 00002_billing_periods.sql.
-- =========================================================================

-- 1. Unique constraint to prevent duplicate periods for the same tenant-month
alter table public.billing_periods
  add constraint billing_periods_tenant_month_unique
  unique (tenant_id, period_start);

-- 2. Sync tenant cache function — keeps outstanding_balance and paid accurate
create or replace function public.sync_tenant_cache(p_tenant_id uuid)
returns void as $$
declare
  total_due numeric;
  total_paid numeric;
  balance numeric;
begin
  select coalesce(sum(rent_due), 0) into total_due
  from public.billing_periods
  where tenant_id = p_tenant_id;

  select coalesce(sum(pa.amount), 0) into total_paid
  from public.payment_allocations pa
  join public.billing_periods bp on bp.id = pa.period_id
  where bp.tenant_id = p_tenant_id;

  balance := total_due - total_paid;

  update public.tenants
  set outstanding_balance = balance,
      paid = (balance <= 0)
  where id = p_tenant_id;
end;
$$ language plpgsql security definer;

-- 3. Improved initial-billing-period trigger — idempotent, uses sync function
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

  if not exists (
    select 1 from public.billing_periods
    where tenant_id = new.id and period_start = month_start
  ) then
    insert into public.billing_periods (tenant_id, period_start, period_end, rent_due, status)
    values (new.id, month_start, month_end, greatest(rent, 0), 'unpaid');
  end if;

  perform public.sync_tenant_cache(new.id);
  return new;
end;
$$ language plpgsql security definer;
