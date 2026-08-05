-- where we were — initial schema.
-- Apply via the Supabase SQL editor (one-time; no supabase CLI in this slice).

create extension if not exists pgcrypto;

create type task_status as enum (
  'idea', 'todo', 'in-progress', 'blocked-needs-decision', 'parked-with-context', 'done'
);

create table projects (
  id           text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name         text not null check (char_length(trim(name)) > 0),
  remote       text unique,
  status_note  text not null default '',
  dormant      boolean not null default false,
  last_touched timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

create table tasks (
  id            uuid primary key default gen_random_uuid(),
  title         text not null check (char_length(trim(title)) > 0),
  project_id    text references projects(id) on delete set null,
  status        task_status not null default 'idea',
  priority      smallint not null default 3 check (priority between 1 and 3),
  last_touched  timestamptz not null default now(),
  session_label text,
  context       jsonb,  -- {repo, branch, files[], sha, decisions[], nextStep}
  blocker       jsonb,  -- {question, options: [{id, label, recommended?}]}
  updated_at    timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create table wins (
  id         uuid primary key default gen_random_uuid(),
  project_id text not null references projects(id) on delete cascade,
  line       text not null check (char_length(trim(line)) > 0),
  at         timestamptz not null default now()
);

create index tasks_project_id_idx    on tasks(project_id);
create index tasks_status_idx        on tasks(status);
create index tasks_last_touched_idx  on tasks(last_touched desc);
create index wins_project_id_idx     on wins(project_id);
create index wins_at_idx             on wins(at desc);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_tasks_updated_at    before update on tasks    for each row execute function set_updated_at();
create trigger trg_projects_updated_at before update on projects for each row execute function set_updated_at();

-- Fail-closed: RLS on, no policies. service_role (used only by the CLI over a
-- direct Postgres connection) bypasses RLS; anon/authenticated get zero rows
-- until the viewer slice adds real policies.
alter table projects enable row level security;
alter table tasks    enable row level security;
alter table wins     enable row level security;
