-- Run in Supabase SQL editor if product_media approval columns are missing.

alter table public.product_media add column if not exists is_public boolean not null default false;
alter table public.product_media add column if not exists is_primary boolean not null default false;
alter table public.product_media add column if not exists uploaded_by text not null default 'farmer';
alter table public.product_media add column if not exists status text not null default 'pending';

alter table public.product_media drop constraint if exists product_media_uploaded_by_check;
alter table public.product_media add constraint product_media_uploaded_by_check
  check (uploaded_by in ('farmer', 'admin'));

alter table public.product_media drop constraint if exists product_media_status_check;
alter table public.product_media add constraint product_media_status_check
  check (status in ('pending', 'approved', 'ignored'));

update public.product_media pm
set
  is_public = true,
  status = 'approved'
from public.products p
where p.id = pm.product_id
  and p.review_status in ('Approved', 'approved')
  and pm.status is distinct from 'ignored';

drop policy if exists "product_media_admin_read_all" on public.product_media;
create policy "product_media_admin_read_all"
on public.product_media for select to authenticated
using (public.current_user_role() = 'admin');

drop policy if exists "product_media_public_read_approved_product" on public.product_media;
create policy "product_media_public_read_approved_product"
on public.product_media for select to anon, authenticated
using (
  is_public = true
  and status = 'approved'
  and exists (
    select 1 from public.products p
    where p.id = product_id
      and p.is_active = true
      and p.review_status in ('Approved', 'approved')
      and p.availability_status = 'Active'
  )
);
