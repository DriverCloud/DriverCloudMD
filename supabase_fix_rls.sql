-- Allow Admins and Owners to insert evaluations (needed for backfill or admin override)
create policy "Admins and Owners can create evaluations"
  on public.class_evaluations for insert
  to authenticated
  with check (
    exists (
      select 1 from public.memberships
      where memberships.user_id = auth.uid()
      and memberships.role in ('owner', 'admin')
    )
  );

-- Allow Admins and Owners to view all evaluations
create policy "Admins and Owners can view all evaluations"
  on public.class_evaluations for select
  to authenticated
  using (
    exists (
      select 1 from public.memberships
      where memberships.user_id = auth.uid()
      and memberships.role in ('owner', 'admin')
    )
  );
