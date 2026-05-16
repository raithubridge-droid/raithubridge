-- RaithuBridge schema for Supabase.
-- Run in Supabase SQL editor or via `supabase db push`.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'buyer' check (role in ('buyer', 'seller', 'admin')),
  phone text,
  whatsapp text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_role_idx on public.users (role);

-- Compatibility view for older auth helper code.
create or replace view public.profiles as
select id, email, full_name, role, created_at, updated_at
from public.users;

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

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.users (id) on delete set null,
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
  seller_location text not null,
  delivery_info text,
  seller_info text,
  status text not null default 'available' check (status in ('available', 'limited', 'seasonal', 'draft', 'archived')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_seller_idx on public.products (seller_id);
create index if not exists products_active_status_idx on public.products (is_active, status);

-- ---------------------------------------------------------------------------
-- Product media
-- ---------------------------------------------------------------------------
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
  availability_status text not null default 'in_stock' check (availability_status in ('in_stock', 'out_of_stock')),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Carts and cart items
-- ---------------------------------------------------------------------------
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade,
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

-- ---------------------------------------------------------------------------
-- Orders and payments
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
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
  select role from public.users where id = auth.uid()
$$;

grant execute on function public.current_user_role() to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_media enable row level security;
alter table public.inventory enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;

drop policy if exists "users_select_own_or_admin" on public.users;
drop policy if exists "users_insert_own" on public.users;
drop policy if exists "users_update_own_or_admin" on public.users;

create policy "users_select_own_or_admin"
on public.users for select to authenticated
using (id = auth.uid() or public.current_user_role() = 'admin');

create policy "users_insert_own"
on public.users for insert to authenticated
with check (id = auth.uid() and role in ('buyer', 'seller'));

create policy "users_update_own_or_admin"
on public.users for update to authenticated
using (id = auth.uid() or public.current_user_role() = 'admin')
with check ((id = auth.uid() and role in ('buyer', 'seller')) or public.current_user_role() = 'admin');

drop policy if exists "categories_public_read" on public.categories;
drop policy if exists "categories_admin_write" on public.categories;

create policy "categories_public_read"
on public.categories for select to anon, authenticated
using (true);

create policy "categories_admin_write"
on public.categories for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "products_public_read_active" on public.products;
drop policy if exists "products_seller_or_admin_write" on public.products;

create policy "products_public_read_active"
on public.products for select to anon, authenticated
using (is_active = true and status <> 'draft');

create policy "products_seller_or_admin_write"
on public.products for all to authenticated
using (seller_id = auth.uid() or public.current_user_role() = 'admin')
with check (seller_id = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists "product_media_public_read_active_product" on public.product_media;
drop policy if exists "product_media_seller_or_admin_write" on public.product_media;

create policy "product_media_public_read_active_product"
on public.product_media for select to anon, authenticated
using (
  exists (
    select 1 from public.products p
    where p.id = product_id and p.is_active = true and p.status <> 'draft'
  )
);

create policy "product_media_seller_or_admin_write"
on public.product_media for all to authenticated
using (
  exists (
    select 1 from public.products p
    where p.id = product_id and (p.seller_id = auth.uid() or public.current_user_role() = 'admin')
  )
)
with check (
  exists (
    select 1 from public.products p
    where p.id = product_id and (p.seller_id = auth.uid() or public.current_user_role() = 'admin')
  )
);

drop policy if exists "inventory_public_read" on public.inventory;
drop policy if exists "inventory_admin_write" on public.inventory;

create policy "inventory_public_read"
on public.inventory for select to anon, authenticated
using (true);

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
