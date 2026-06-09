-- Keep only approved products publicly visible.
update public.products
set
  is_active = false,
  availability_status = 'Inactive'
where review_status in ('Pending Review', 'On Hold', 'Rejected');

update public.products
set
  is_active = true,
  availability_status = 'Active'
where review_status = 'Approved';
