-- RaithuBridge: starter schema for Supabase (run in SQL editor or via `supabase db push`).
-- Align RLS with your security model before production.

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users) — roles for farmers, buyers, and admins
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'buyer' check (role in ('farmer', 'buyer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------------------------
-- Farmer registration / product submissions — admin approves into `products`
-- ---------------------------------------------------------------------------
create table if not exists public.farmer_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  farmer_name text not null,
  phone text not null,
  whatsapp text not null,
  village text not null,
  district text not null,
  state text not null,
  product_name text not null,
  category text not null,
  quantity_available text not null,
  unit text not null,
  price text not null,
  description text not null,
  media_assets jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists farmer_submissions_status_idx on public.farmer_submissions (status);
create index if not exists farmer_submissions_user_idx on public.farmer_submissions (user_id);

-- ---------------------------------------------------------------------------
-- Approved product catalog (buyer-facing)
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references public.farmer_submissions (id) on delete set null,
  farmer_user_id uuid references auth.users (id) on delete set null,
  name text not null,
  category text not null,
  farmer_location text not null,
  price_display text not null,
  quantity_display text not null,
  media_assets jsonb not null default '[]'::jsonb,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_approved_idx on public.products (is_approved);

-- ---------------------------------------------------------------------------
-- Product media bucket
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-media',
  'product-media',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

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
-- RLS: role-aware access for farmers, buyers, and admins
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.farmer_submissions enable row level security;
alter table public.products enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own_or_admin" on public.profiles;

create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.current_user_role() = 'admin');

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid() and role in ('buyer', 'farmer'));

create policy "profiles_update_own_or_admin"
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.current_user_role() = 'admin')
with check (
  (id = auth.uid() and role in ('buyer', 'farmer'))
  or public.current_user_role() = 'admin'
);

drop policy if exists "farmer_submissions_insert_farmer" on public.farmer_submissions;
drop policy if exists "farmer_submissions_select_own_or_admin" on public.farmer_submissions;
drop policy if exists "farmer_submissions_update_admin" on public.farmer_submissions;

create policy "farmer_submissions_insert_farmer"
on public.farmer_submissions
for insert
to authenticated
with check (user_id = auth.uid() and public.current_user_role() in ('farmer', 'admin'));

create policy "farmer_submissions_select_own_or_admin"
on public.farmer_submissions
for select
to authenticated
using (user_id = auth.uid() or public.current_user_role() = 'admin');

create policy "farmer_submissions_update_admin"
on public.farmer_submissions
for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "products_select_approved_or_owner_or_admin" on public.products;
drop policy if exists "products_insert_farmer_or_admin" on public.products;
drop policy if exists "products_update_owner_or_admin" on public.products;

create policy "products_select_approved_or_owner_or_admin"
on public.products
for select
to anon, authenticated
using (
  is_approved = true
  or farmer_user_id = auth.uid()
  or public.current_user_role() = 'admin'
);

create policy "products_insert_farmer_or_admin"
on public.products
for insert
to authenticated
with check (farmer_user_id = auth.uid() and public.current_user_role() in ('farmer', 'admin'));

create policy "products_update_owner_or_admin"
on public.products
for update
to authenticated
using (farmer_user_id = auth.uid() or public.current_user_role() = 'admin')
with check (farmer_user_id = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists "product_media_public_read" on storage.objects;
drop policy if exists "product_media_insert_farmer" on storage.objects;
drop policy if exists "product_media_update_owner_or_admin" on storage.objects;
drop policy if exists "product_media_delete_owner_or_admin" on storage.objects;

create policy "product_media_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'product-media');

create policy "product_media_insert_farmer"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-media'
  and (storage.foldername(name))[1] = auth.uid()::text
  and public.current_user_role() in ('farmer', 'admin')
);

create policy "product_media_update_owner_or_admin"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-media'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.current_user_role() = 'admin')
)
with check (
  bucket_id = 'product-media'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.current_user_role() = 'admin')
);

create policy "product_media_delete_owner_or_admin"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-media'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.current_user_role() = 'admin')
);
