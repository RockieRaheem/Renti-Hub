-- =========================================================================
-- RentiHub — Production Schema
-- =========================================================================
-- Run this in your Supabase SQL Editor or via `supabase migration up`
-- =========================================================================

-- 0. Extensions
create extension if not exists "pgcrypto";

-- 1. Profiles (extends Supabase Auth)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. Buildings
create table if not exists public.buildings (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  location    text default '',
  type        text default 'Mixed-Use',
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now()
);
alter table public.buildings enable row level security;

create policy "Users manage own buildings"
  on public.buildings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. Floors
create table if not exists public.floors (
  id          uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now()
);
alter table public.floors enable row level security;

create policy "Floors inherit building access"
  on public.floors for all
  using (exists (
    select 1 from public.buildings
    where buildings.id = floors.building_id and buildings.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.buildings
    where buildings.id = floors.building_id and buildings.user_id = auth.uid()
  ));

-- 4. Units
create table if not exists public.units (
  id           uuid primary key default gen_random_uuid(),
  floor_id     uuid not null references public.floors(id) on delete cascade,
  building_id  uuid not null references public.buildings(id) on delete cascade,
  name         text not null,
  type         text not null default 'Retail',
  size         text not null default 'TBD',
  monthly_rent numeric(12,2) not null default 0,
  rent_display text not null default 'TBD',
  status       text not null default 'vacant'
               check (status in ('vacant','occupied')),
  created_at   timestamptz not null default now()
);
alter table public.units enable row level security;

create policy "Units inherit building access"
  on public.units for all
  using (exists (
    select 1 from public.buildings
    where buildings.id = units.building_id and buildings.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.buildings
    where buildings.id = units.building_id and buildings.user_id = auth.uid()
  ));

-- 5. Tenants
create table if not exists public.tenants (
  id                  uuid primary key default gen_random_uuid(),
  unit_id             uuid not null references public.units(id) on delete cascade,
  building_id         uuid not null references public.buildings(id) on delete cascade,
  name                text not null,
  initials            text not null default '',
  email               text default '',
  phone               text default '',
  lease_start         text default '',
  lease_end           text default '',
  lease_term          text default '',
  payment_status      text not null default 'Good Payer',
  paid                boolean not null default true,
  outstanding_balance numeric(12,2) not null default 0,
  last_payment        text default '',
  last_payment_date   text default '',
  created_at          timestamptz not null default now()
);
alter table public.tenants enable row level security;

create policy "Tenants inherit building access"
  on public.tenants for all
  using (exists (
    select 1 from public.buildings
    where buildings.id = tenants.building_id and buildings.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.buildings
    where buildings.id = tenants.building_id and buildings.user_id = auth.uid()
  ));

-- 6. Payments
create table if not exists public.payments (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid references public.tenants(id) on delete set null,
  unit_id      uuid not null references public.units(id) on delete cascade,
  floor_id     uuid not null references public.floors(id) on delete cascade,
  building_id  uuid not null references public.buildings(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  amount       numeric(12,2) not null,
  method       text not null default 'Cash',
  status       text not null default 'Paid',
  tenant_name  text default '',
  date         date not null default current_date,
  created_at   timestamptz not null default now()
);
alter table public.payments enable row level security;

create policy "Payments inherit building access"
  on public.payments for all
  using (exists (
    select 1 from public.buildings
    where buildings.id = payments.building_id and buildings.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.buildings
    where buildings.id = payments.building_id and buildings.user_id = auth.uid()
  ));

-- 7. Maintenance Requests
create table if not exists public.maintenance_requests (
  id           uuid primary key default gen_random_uuid(),
  building_id  uuid not null references public.buildings(id) on delete cascade,
  floor_name   text default '',
  unit_name    text default '',
  tenant_name  text default '',
  title        text not null,
  priority     text not null default 'Medium'
               check (priority in ('Low','Medium','High','Critical')),
  status       text not null default 'pending'
               check (status in ('pending','in_progress','resolved')),
  assignee     text default null,
  resolution   text default null,
  created_at   timestamptz not null default now()
);
alter table public.maintenance_requests enable row level security;

create policy "Maintenance inherit building access"
  on public.maintenance_requests for all
  using (exists (
    select 1 from public.buildings
    where buildings.id = maintenance_requests.building_id and buildings.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.buildings
    where buildings.id = maintenance_requests.building_id and buildings.user_id = auth.uid()
  ));

-- 8. Audit Log
create table if not exists public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  action      text not null,
  details     text default '',
  created_at  timestamptz not null default now()
);
alter table public.audit_log enable row level security;

create policy "Users see own audit log"
  on public.audit_log for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 9. Indexes for performance
create index idx_units_floor_id on public.units(floor_id);
create index idx_units_building_id on public.units(building_id);
create index idx_units_status on public.units(status);
create index idx_tenants_unit_id on public.tenants(unit_id);
create index idx_tenants_building_id on public.tenants(building_id);
create index idx_payments_building_id on public.payments(building_id);
create index idx_payments_tenant_id on public.payments(tenant_id);
create index idx_payments_date on public.payments(date);
create index idx_maintenance_building_id on public.maintenance_requests(building_id);
create index idx_maintenance_status on public.maintenance_requests(status);
create index idx_audit_log_user_id on public.audit_log(user_id);
create index idx_audit_log_created_at on public.audit_log(created_at desc);

-- 10. Triggers
-- Auto-set building_id on units
create or replace function public.set_unit_building_id()
returns trigger as $$
begin
  new.building_id := (select building_id from public.floors where id = new.floor_id);
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_units_set_building_id
  before insert on public.units
  for each row execute function public.set_unit_building_id();

-- Auto-set building_id on tenants
create or replace function public.set_tenant_building_id()
returns trigger as $$
begin
  new.building_id := (select u.building_id from public.units u where u.id = new.unit_id);
  new.initials := upper(left(split_part(new.name, ' ', 1), 1) || coalesce(left(split_part(new.name, ' ', 2), 1), ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_tenants_set_building_id
  before insert on public.tenants
  for each row execute function public.set_tenant_building_id();

-- Auto-update unit status when tenant is added/removed
create or replace function public.update_unit_status_on_tenant_change()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.units set status = 'occupied', monthly_rent = coalesce(
      (select monthly_rent from public.units where id = new.unit_id), 0
    ) where id = new.unit_id;
  elsif tg_op = 'DELETE' then
    update public.units set status = 'vacant' where id = old.unit_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger trg_tenants_update_unit
  after insert or delete on public.tenants
  for each row execute function public.update_unit_status_on_tenant_change();

-- Auto-compute rent_display on units
create or replace function public.set_rent_display()
returns trigger as $$
begin
  new.rent_display := case
    when new.monthly_rent > 0 then 'UGX ' || to_char(new.monthly_rent, 'FM999,999,999') || '/mo'
    else 'TBD'
  end;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_units_set_rent_display
  before insert or update of monthly_rent on public.units
  for each row execute function public.set_rent_display();

-- 11. Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
