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
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_approved_idx on public.products (is_approved);

-- ---------------------------------------------------------------------------
-- RLS: enable and add policies (examples — tighten for production)
-- ---------------------------------------------------------------------------
-- alter table public.profiles enable row level security;
-- alter table public.farmer_submissions enable row level security;
-- alter table public.products enable row level security;
--
-- Example policies:
-- - profiles: user can read/update own row.
-- - farmer_submissions: farmers insert own; read own; admin reads all.
-- - products: public read where is_approved = true; farmers/admins manage own rows.
