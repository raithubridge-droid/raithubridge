-- RaithuBridge schema for Supabase.
-- Run in Supabase SQL editor or via `supabase db push`.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Profiles linked to Supabase Auth
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null default 'user' check (role in ('user', 'admin')),
  whatsapp text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into public.categories (name, slug, display_order)
values
  ('Vegetables', 'vegetables', 10),
  ('Fruits', 'fruits', 20),
  ('Grains', 'grains', 30),
  ('Dairy', 'dairy', 40),
  ('Spices', 'spices', 50),
  ('Flowers', 'flowers', 60),
  ('Other', 'other', 70)
on conflict (slug) do update
set
  display_order = excluded.display_order,
  name = excluded.name;

-- ---------------------------------------------------------------------------
-- Products and product media
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.profiles (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text not null,
  price numeric(12, 2) not null,
  currency text not null default 'INR',
  unit text not null,
  unit_size text not null,
  quantity_available numeric(12, 2) not null default 0,
  seller_name text not null,
  seller_phone text,
  seller_whatsapp text,
  seller_village_city text,
  seller_district text,
  seller_state text,
  seller_location text not null,
  delivery_info text,
  seller_info text,
  status text not null default 'Pending Review' check (
    status in (
      'Pending Review', 'On Hold', 'Approved', 'Rejected',
      'pending', 'on_hold', 'approved', 'rejected',
      'available', 'limited', 'seasonal', 'draft', 'archived'
    )
  ),
  review_status text not null default 'Pending Review' check (
    review_status in ('Pending Review', 'On Hold', 'Approved', 'Rejected')
  ),
  availability_status text not null default 'Inactive' check (
    availability_status in ('Active', 'Inactive', 'Sold Out')
  ),
  is_active boolean not null default true,
  admin_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products add column if not exists seller_phone text;
alter table public.products add column if not exists seller_whatsapp text;
alter table public.products add column if not exists seller_village_city text;
alter table public.products add column if not exists seller_district text;
alter table public.products add column if not exists seller_state text;
alter table public.products add column if not exists admin_comment text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'phone'
  ) then
    update public.products
    set seller_phone = coalesce(seller_phone, phone);
    alter table public.products drop column phone;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'whatsapp'
  ) then
    update public.products
    set seller_whatsapp = coalesce(seller_whatsapp, whatsapp);
    alter table public.products drop column whatsapp;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'village_city'
  ) then
    update public.products
    set seller_village_city = coalesce(seller_village_city, village_city);
    alter table public.products drop column village_city;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'district'
  ) then
    update public.products
    set seller_district = coalesce(seller_district, district);
    alter table public.products drop column district;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'state'
  ) then
    update public.products
    set seller_state = coalesce(seller_state, state);
    alter table public.products drop column state;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'category_name'
  ) then
    update public.products p
    set category_id = c.id
    from public.categories c
    where p.category_id is null
      and lower(c.name) = lower(p.category_name);

    alter table public.products drop column category_name;
  end if;
end;
$$;

alter table public.products alter column status set default 'Pending Review';
alter table public.products drop constraint if exists products_status_check;
alter table public.products add constraint products_status_check check (
  status in (
    'Pending', 'Pending Review', 'On Hold', 'Approved', 'Rejected',
    'pending', 'on_hold', 'approved', 'rejected',
    'available', 'limited', 'seasonal', 'draft', 'archived'
  )
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_seller_idx on public.products (seller_id);
create index if not exists products_active_status_idx on public.products (is_active, status);
create index if not exists products_review_availability_idx
on public.products (review_status, availability_status);

alter table public.products
add column if not exists review_status text not null default 'Pending Review';

alter table public.products
add column if not exists availability_status text not null default 'Inactive';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_review_status_check'
  ) then
    alter table public.products
    add constraint products_review_status_check
    check (review_status in ('Pending Review', 'On Hold', 'Approved', 'Rejected'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'products_availability_status_check'
  ) then
    alter table public.products
    add constraint products_availability_status_check
    check (availability_status in ('Active', 'Inactive', 'Sold Out'));
  end if;
end $$;

update public.products
set
  review_status = case
    when status in ('Approved', 'approved', 'available', 'limited', 'seasonal') then 'Approved'
    when status in ('On Hold', 'on_hold') then 'On Hold'
    when status in ('Rejected', 'rejected', 'archived') then 'Rejected'
    else 'Pending Review'
  end,
  availability_status = case
    when is_active = false then 'Inactive'
    when quantity_available <= 0 then 'Sold Out'
    when status in ('Approved', 'approved', 'available', 'limited', 'seasonal') then 'Active'
    else 'Inactive'
  end;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create table if not exists public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  storage_path text,
  media_type text not null check (media_type in ('image', 'video')),
  mime_type text,
  name text not null,
  size_bytes integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_media_product_idx on public.product_media (product_id, sort_order);

-- ---------------------------------------------------------------------------
-- Inventory
-- ---------------------------------------------------------------------------
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique references public.products (id) on delete cascade,
  stock_count numeric(12, 2) not null default 0,
  in_stock boolean not null default true,
  availability_status text not null default 'Active' check (availability_status in ('Active', 'Inactive', 'Sold Out')),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_inventory_updated_at on public.inventory;
create trigger set_inventory_updated_at
before update on public.inventory
for each row execute function public.set_updated_at();

alter table public.inventory
drop constraint if exists inventory_availability_status_check;

update public.inventory
set availability_status = case
  when in_stock = false or stock_count <= 0 then 'Sold Out'
  else 'Active'
end
where availability_status in ('in_stock', 'out_of_stock');

alter table public.inventory
add constraint inventory_availability_status_check
check (availability_status in ('Active', 'Inactive', 'Sold Out'));

-- ---------------------------------------------------------------------------
-- Carts and cart items
-- ---------------------------------------------------------------------------
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  guest_id text,
  status text not null default 'active' check (status in ('active', 'converted', 'abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((user_id is not null) or (guest_id is not null))
);

create unique index if not exists carts_active_user_idx
on public.carts (user_id)
where status = 'active' and user_id is not null;

create unique index if not exists carts_active_guest_idx
on public.carts (guest_id)
where status = 'active' and guest_id is not null;

drop trigger if exists set_carts_updated_at on public.carts;
create trigger set_carts_updated_at
before update on public.carts
for each row execute function public.set_updated_at();

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_id)
);

create index if not exists cart_items_cart_idx on public.cart_items (cart_id);

drop trigger if exists set_cart_items_updated_at on public.cart_items;
create trigger set_cart_items_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Orders and payments
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  cart_id uuid references public.carts (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'paid')),
  items jsonb not null default '[]'::jsonb,
  subtotal_amount numeric(12, 2) not null default 0,
  currency text not null default 'INR',
  customer_name text,
  customer_email text,
  customer_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id);

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider text,
  provider_payment_id text,
  amount numeric(12, 2) not null,
  currency text not null default 'INR',
  status text not null default 'pending' check (status in ('pending', 'authorized', 'paid', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_order_idx on public.payments (order_id);

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Role helper
-- ---------------------------------------------------------------------------
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

grant execute on function public.current_user_role() to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_media enable row level security;
alter table public.inventory enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own_or_admin" on public.profiles;

create policy "profiles_select_own_or_admin"
on public.profiles for select to authenticated
using (id = auth.uid() or public.current_user_role() = 'admin');

create policy "profiles_insert_own"
on public.profiles for insert to authenticated
with check (id = auth.uid() and role = 'user');

create policy "profiles_update_own_or_admin"
on public.profiles for update to authenticated
using (id = auth.uid() or public.current_user_role() = 'admin')
with check ((id = auth.uid() and role = 'user') or public.current_user_role() = 'admin');

drop policy if exists "categories_public_read" on public.categories;
drop policy if exists "categories_admin_write" on public.categories;
drop policy if exists "categories_authenticated_insert" on public.categories;

create policy "categories_public_read"
on public.categories for select to anon, authenticated
using (true);

create policy "categories_admin_write"
on public.categories for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "products_public_read_approved" on public.products;
drop policy if exists "products_submitter_insert" on public.products;
drop policy if exists "products_submitter_read_own" on public.products;
drop policy if exists "products_submitter_update_own_pending" on public.products;
drop policy if exists "products_admin_all" on public.products;

create policy "products_public_read_approved"
on public.products for select to anon, authenticated
using (
  is_active = true
  and review_status = 'Approved'
  and availability_status = 'Active'
);

create policy "products_submitter_read_own"
on public.products for select to authenticated
using (seller_id = auth.uid());

create policy "products_submitter_insert"
on public.products for insert to authenticated
with check (
  seller_id = auth.uid()
  and review_status = 'Pending Review'
);

create policy "products_submitter_update_own_pending"
on public.products for update to authenticated
using (seller_id = auth.uid() and review_status in ('Pending Review', 'On Hold'))
with check (seller_id = auth.uid() and review_status = 'Pending Review');

create policy "products_admin_all"
on public.products for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "product_media_public_read_approved_product" on public.product_media;
drop policy if exists "product_media_submitter_or_admin_write" on public.product_media;

create policy "product_media_public_read_approved_product"
on public.product_media for select to anon, authenticated
using (
  exists (
    select 1 from public.products p
    where p.id = product_id
      and p.is_active = true
      and p.review_status = 'Approved'
      and p.availability_status = 'Active'
  )
);

create policy "product_media_submitter_or_admin_write"
on public.product_media for all to authenticated
using (
  exists (
    select 1 from public.products p
    where p.id = product_id
      and (p.seller_id = auth.uid() or public.current_user_role() = 'admin')
  )
)
with check (
  exists (
    select 1 from public.products p
    where p.id = product_id
      and (p.seller_id = auth.uid() or public.current_user_role() = 'admin')
  )
);

drop policy if exists "inventory_public_read_available" on public.inventory;
drop policy if exists "inventory_admin_write" on public.inventory;

create policy "inventory_public_read_available"
on public.inventory for select to anon, authenticated
using (
  exists (
    select 1 from public.products p
    where p.id = product_id
      and p.is_active = true
      and p.review_status = 'Approved'
      and p.availability_status = 'Active'
  )
);

create policy "inventory_admin_write"
on public.inventory for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "carts_owner_read_write" on public.carts;
drop policy if exists "cart_items_owner_read_write" on public.cart_items;

create policy "carts_owner_read_write"
on public.carts for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "cart_items_owner_read_write"
on public.cart_items for all to authenticated
using (
  exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
)
with check (
  exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
);

drop policy if exists "orders_owner_or_admin_read" on public.orders;
drop policy if exists "orders_owner_insert" on public.orders;
drop policy if exists "payments_owner_or_admin_read" on public.payments;
drop policy if exists "payments_owner_insert" on public.payments;

create policy "orders_owner_or_admin_read"
on public.orders for select to authenticated
using (user_id = auth.uid() or public.current_user_role() = 'admin');

create policy "orders_owner_insert"
on public.orders for insert to authenticated
with check (user_id = auth.uid());

create policy "payments_owner_or_admin_read"
on public.payments for select to authenticated
using (
  public.current_user_role() = 'admin'
  or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);

create policy "payments_owner_insert"
on public.payments for insert to authenticated
with check (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);
