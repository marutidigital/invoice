-- ProInvoice — Supabase Database Schema
-- Run this entire file in the Supabase SQL editor:
-- Dashboard → SQL Editor → New query → Paste → Run
-- ✅ Safe to run multiple times — drops and recreates cleanly

-- ============================================================
-- CLEAN SLATE: drop everything first (safe — no real data yet)
-- ============================================================

drop trigger if exists set_updated_at on invoice_items;
drop trigger if exists set_updated_at on invoices;
drop trigger if exists set_updated_at on clients;
drop trigger if exists set_updated_at on profiles;
drop trigger if exists set_updated_at on businesses;
drop trigger if exists on_auth_user_created on auth.users;

drop function if exists update_updated_at() cascade;
drop function if exists handle_new_user() cascade;

drop table if exists invoice_items cascade;
drop table if exists invoices cascade;
drop table if exists clients cascade;
drop table if exists profiles cascade;
drop table if exists businesses cascade;

-- ============================================================
-- TABLES
-- ============================================================

-- 1. businesses: stores user's business entities
create table businesses (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users on delete cascade not null,
  name             text not null default '',
  contact_name     text,
  email            text,
  phone            text,
  address          text,
  city             text,
  state            text,
  postcode         text,
  country          text not null default 'US',
  logo_url         text,
  currency         text not null default 'USD',
  tax_label        text default 'Tax',
  tax_rate         numeric(5,2) default 0,
  payment_info     text,
  default_notes    text,
  invoice_prefix   text not null default 'INV',
  invoice_counter  integer not null default 0,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- 2. profiles: links authenticated users to their active business
create table profiles (
  id                 uuid references auth.users on delete cascade primary key,
  email              text not null default '',
  active_business_id uuid references businesses on delete set null,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- 3. clients: address book scoped per business
create table clients (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users on delete cascade not null,
  business_id  uuid references businesses on delete cascade not null,
  name         text not null,
  email        text,
  phone        text,
  company      text,
  address      text,
  notes        text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- 4. invoices: invoice or estimate records scoped per business
create table invoices (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users on delete cascade not null,
  business_id      uuid references businesses on delete cascade not null,
  client_id        uuid references clients on delete set null,
  invoice_number   text not null,
  status           text not null default 'draft', -- draft, sent, paid, overdue (invoices) / draft, sent, accepted, declined (estimates)
  type             text not null default 'invoice' check (type in ('invoice', 'estimate')),
  parent_id        uuid references invoices on delete set null, -- link back to original estimate if converted
  issue_date       date not null default current_date,
  due_date         date,
  currency         text not null default 'USD',
  po_number        text,

  -- Snapshot of sender info at time of invoice
  from_name        text,
  from_email       text,
  from_phone       text,
  from_address     text,
  from_logo_url    text,

  -- Snapshot of client info at time of invoice
  to_name          text,
  to_email         text,
  to_phone         text,
  to_company       text,
  to_address       text,

  -- Financials
  subtotal         numeric(12,2) not null default 0,
  tax_amount       numeric(12,2) not null default 0,
  discount_amount  numeric(12,2) not null default 0,
  total            numeric(12,2) not null default 0,

  notes            text,
  payment_info     text,
  template_id      text not null default 'clean',

  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- 5. invoice_items: line items per invoice/estimate
create table invoice_items (
  id           uuid primary key default gen_random_uuid(),
  invoice_id   uuid references invoices on delete cascade not null,
  sort_order   integer not null default 0,
  description  text not null,
  quantity     numeric(10,2) not null default 1,
  unit_price   numeric(12,2) not null default 0,
  tax_rate     numeric(5,2) default 0,
  total        numeric(12,2) not null default 0
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_businesses_user_id on businesses(user_id);
create index idx_clients_user_id on clients(user_id);
create index idx_clients_business_id on clients(business_id);
create index idx_invoices_user_id on invoices(user_id);
create index idx_invoices_business_id on invoices(business_id);
create index idx_invoices_client_id on invoices(client_id);
create index idx_invoices_status on invoices(status);
create index idx_invoices_type on invoices(type);
create index idx_invoice_items_invoice_id on invoice_items(invoice_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table businesses enable row level security;
alter table profiles enable row level security;
alter table clients enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;

-- businesses: users can only access their own businesses
create policy "businesses: own data only" on businesses
  for all using (auth.uid() = user_id);

-- profiles: users can only access their own profile
create policy "profiles: own data only" on profiles
  for all using (auth.uid() = id);

-- clients: users can only access their own clients
create policy "clients: own data only" on clients
  for all using (auth.uid() = user_id);

-- invoices: users can only access their own invoices
create policy "invoices: own data only" on invoices
  for all using (auth.uid() = user_id);

-- invoice_items: accessible only through invoices owned by the user
create policy "invoice_items: own invoice items only" on invoice_items
  for all using (
    invoice_id in (
      select id from invoices where user_id = auth.uid()
    )
  );

-- ============================================================
-- TRIGGERS: updated_at auto-update
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on businesses
  for each row execute function update_updated_at();

create trigger set_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger set_updated_at
  before update on clients
  for each row execute function update_updated_at();

create trigger set_updated_at
  before update on invoices
  for each row execute function update_updated_at();

-- ============================================================
-- AUTO-CREATE DEFAULT BUSINESS & PROFILE ON SIGNUP
-- ============================================================

create or replace function handle_new_user()
returns trigger as $$
declare
  default_business_id uuid;
  biz_name text;
begin
  biz_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  if biz_name = '' then
    biz_name := 'My Business';
  end if;

  -- 1. Create a default business for the user
  insert into public.businesses (user_id, name, email)
  values (
    new.id,
    biz_name,
    coalesce(new.email, '')
  )
  returning id into default_business_id;

  -- 2. Create the user's profile and link it to their default business
  insert into public.profiles (id, email, active_business_id)
  values (
    new.id,
    coalesce(new.email, ''),
    default_business_id
  )
  on conflict (id) do update
  set active_business_id = default_business_id;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- DONE ✅
-- ============================================================
