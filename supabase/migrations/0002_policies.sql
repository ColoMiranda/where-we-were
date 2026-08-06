-- Template note: replace OWNER_EMAIL with your Supabase auth user's email before applying.
-- where we were — RLS policies for the viewer.
-- Apply via the Supabase SQL editor (one-time; no supabase CLI in this slice).
-- anon and any authenticated email other than OWNER_EMAIL
-- stay at zero rows — RLS on every policy below is fail-closed by construction.

grant usage on schema public to authenticated;
grant select on projects, wins to authenticated;
grant select, insert, update on tasks to authenticated;

drop policy if exists projects_select on projects;
create policy projects_select
  on projects
  for select
  to authenticated
  using ((select auth.jwt() ->> 'email') = 'OWNER_EMAIL');

drop policy if exists tasks_select on tasks;
create policy tasks_select
  on tasks
  for select
  to authenticated
  using ((select auth.jwt() ->> 'email') = 'OWNER_EMAIL');

drop policy if exists wins_select on wins;
create policy wins_select
  on wins
  for select
  to authenticated
  using ((select auth.jwt() ->> 'email') = 'OWNER_EMAIL');

-- The viewer only ever captures ideas: no project, status 'idea'.
drop policy if exists tasks_insert on tasks;
create policy tasks_insert
  on tasks
  for insert
  to authenticated
  with check (
    (select auth.jwt() ->> 'email') = 'OWNER_EMAIL'
    and project_id is null
    and status = 'idea'
  );

-- Blocker answers. RLS is row-level only — it does not scope which columns
-- an update may touch; the data layer is responsible for only ever writing
-- the blocker/answer column on this path.
drop policy if exists tasks_update on tasks;
create policy tasks_update
  on tasks
  for update
  to authenticated
  using ((select auth.jwt() ->> 'email') = 'OWNER_EMAIL')
  with check ((select auth.jwt() ->> 'email') = 'OWNER_EMAIL');
