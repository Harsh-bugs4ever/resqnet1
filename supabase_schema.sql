-- ============================================================
--  ResQNet — Supabase PostgreSQL Schema
--  Run this in your Supabase SQL Editor
-- ============================================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";   -- optional, for geo queries

-- ─────────────────────────────────────────────
--  PROFILES (extends auth.users)
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  phone       text,
  role        text not null default 'rescue_team'
                check (role in ('admin','government','ngo','rescue_team')),
  team_id     uuid,   -- FK added after teams table
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─────────────────────────────────────────────
--  TEAMS
-- ─────────────────────────────────────────────
create table if not exists public.teams (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  team_type   text not null
                check (team_type in ('rescue','medical','fire','logistics','ngo','government')),
  status      text not null default 'available'
                check (status in ('available','busy','offline')),
  capacity    integer default 5,
  lead_id     uuid references public.profiles(id) on delete set null,
  latitude    double precision,
  longitude   double precision,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Back-fill FK on profiles
alter table public.profiles
  add constraint profiles_team_id_fkey
  foreign key (team_id) references public.teams(id) on delete set null;

-- ─────────────────────────────────────────────
--  INCIDENTS
-- ─────────────────────────────────────────────
create table if not exists public.incidents (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  description   text,
  severity      text not null default 'medium'
                  check (severity in ('low','medium','high','critical')),
  status        text not null default 'active'
                  check (status in ('active','monitoring','resolved','closed')),
  incident_type text default 'other'
                  check (incident_type in
                    ('flood','earthquake','fire','cyclone','landslide',
                     'tsunami','chemical','medical','infrastructure','other')),
  latitude      double precision not null,
  longitude     double precision not null,
  address       text,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─────────────────────────────────────────────
--  ASSIGNMENTS  (team ↔ incident)
-- ─────────────────────────────────────────────
create table if not exists public.assignments (
  id           uuid primary key default uuid_generate_v4(),
  team_id      uuid not null references public.teams(id) on delete cascade,
  incident_id  uuid not null references public.incidents(id) on delete cascade,
  assigned_by  uuid references public.profiles(id) on delete set null,
  status       text not null default 'active'
                 check (status in ('active','completed','cancelled')),
  assigned_at  timestamptz default now(),
  updated_at   timestamptz default now(),
  -- prevent exact duplicate active assignments
  unique (team_id, incident_id, status)
);

-- ─────────────────────────────────────────────
--  RESOURCE REQUESTS
-- ─────────────────────────────────────────────
create table if not exists public.resource_requests (
  id             uuid primary key default uuid_generate_v4(),
  incident_id    uuid not null references public.incidents(id) on delete cascade,
  resource_type  text not null
                   check (resource_type in
                     ('food','water','medical','shelter','clothing','fuel','vehicles','other')),
  quantity       integer not null check (quantity > 0),
  priority       text not null default 'medium'
                   check (priority in ('low','medium','high','critical')),
  status         text not null default 'pending'
                   check (status in ('pending','fulfilled','cancelled')),
  notes          text,
  requested_by   uuid references public.profiles(id) on delete set null,
  created_at     timestamptz default now()
);

-- ─────────────────────────────────────────────
--  ALERTS
-- ─────────────────────────────────────────────
create table if not exists public.alerts (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  message         text not null,
  alert_type      text not null default 'info'
                    check (alert_type in ('info','warning','critical','evacuation')),
  target_role     text default 'all',
  target_team_id  uuid references public.teams(id) on delete set null,
  incident_id     uuid references public.incidents(id) on delete set null,
  created_by      uuid references public.profiles(id) on delete set null,
  read_at         timestamptz,   -- null = unread
  created_at      timestamptz default now()
);

-- ─────────────────────────────────────────────
--  INDEXES  (performance)
-- ─────────────────────────────────────────────
create index if not exists idx_incidents_status   on public.incidents(status);
create index if not exists idx_incidents_severity on public.incidents(severity);
create index if not exists idx_incidents_location on public.incidents(latitude, longitude);
create index if not exists idx_assignments_team   on public.assignments(team_id);
create index if not exists idx_assignments_inc    on public.assignments(incident_id);
create index if not exists idx_assignments_status on public.assignments(status);
create index if not exists idx_resources_status   on public.resource_requests(status);
create index if not exists idx_teams_status       on public.teams(status);
create index if not exists idx_alerts_created     on public.alerts(created_at desc);

-- ─────────────────────────────────────────────
--  UPDATED_AT trigger
-- ─────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tr_profiles_updated before update on public.profiles
  for each row execute function public.handle_updated_at();
create trigger tr_teams_updated before update on public.teams
  for each row execute function public.handle_updated_at();
create trigger tr_incidents_updated before update on public.incidents
  for each row execute function public.handle_updated_at();
create trigger tr_assignments_updated before update on public.assignments
  for each row execute function public.handle_updated_at();

-- ─────────────────────────────────────────────
--  AUTO-CREATE PROFILE on new signup
-- ─────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'role', 'rescue_team')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────
--  ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table public.profiles         enable row level security;
alter table public.teams            enable row level security;
alter table public.incidents        enable row level security;
alter table public.assignments      enable row level security;
alter table public.resource_requests enable row level security;
alter table public.alerts           enable row level security;

-- Helper: get calling user's role
create or replace function public.my_role()
returns text language sql security definer stable as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ── Profiles ──
create policy "Users can read all profiles"
  on public.profiles for select to authenticated using (true);

create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid());

create policy "Admins can update any profile"
  on public.profiles for update to authenticated
  using (public.my_role() in ('admin'));

-- ── Teams ──
create policy "Authenticated users can read teams"
  on public.teams for select to authenticated using (true);

create policy "Admin/govt can insert teams"
  on public.teams for insert to authenticated
  with check (public.my_role() in ('admin','government'));

create policy "Admin/govt or team lead can update"
  on public.teams for update to authenticated
  using (public.my_role() in ('admin','government') or lead_id = auth.uid());

-- ── Incidents ──
create policy "Authenticated users can read incidents"
  on public.incidents for select to authenticated using (true);

create policy "Admin/govt/ngo can create incidents"
  on public.incidents for insert to authenticated
  with check (public.my_role() in ('admin','government','ngo'));

create policy "Admin/govt can update incidents"
  on public.incidents for update to authenticated
  using (public.my_role() in ('admin','government'));

create policy "Admin can delete incidents"
  on public.incidents for delete to authenticated
  using (public.my_role() = 'admin');

-- ── Assignments ──
create policy "Authenticated users can read assignments"
  on public.assignments for select to authenticated using (true);

create policy "Admin/govt can manage assignments"
  on public.assignments for all to authenticated
  using (public.my_role() in ('admin','government'));

-- ── Resource Requests ──
create policy "Authenticated users can read resources"
  on public.resource_requests for select to authenticated using (true);

create policy "Authenticated users can create resource requests"
  on public.resource_requests for insert to authenticated
  with check (auth.uid() is not null);

create policy "Admin/govt can update resources"
  on public.resource_requests for update to authenticated
  using (public.my_role() in ('admin','government'));

-- ── Alerts ──
create policy "Authenticated users can read alerts"
  on public.alerts for select to authenticated using (true);

create policy "Admin/govt can create alerts"
  on public.alerts for insert to authenticated
  with check (public.my_role() in ('admin','government'));

-- ─────────────────────────────────────────────
--  REALTIME  (enable pub/sub for these tables)
-- ─────────────────────────────────────────────
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime
    for table public.incidents, public.teams, public.assignments,
               public.resource_requests, public.alerts;
commit;

-- ─────────────────────────────────────────────
--  SEED DATA  (optional demo data)
-- ─────────────────────────────────────────────

-- Uncomment to insert demo incidents after creating your first admin user:
/*
insert into public.incidents (title, severity, incident_type, latitude, longitude, address, status) values
  ('Major Flood — Dharavi Nagar',       'critical', 'flood',       19.0437, 72.8546, 'Dharavi, Mumbai',       'active'),
  ('Building Collapse — Kurla West',    'high',     'earthquake',  19.0728, 72.8826, 'Kurla West, Mumbai',    'active'),
  ('Chemical Spill — Thane Industrial', 'high',     'chemical',    19.1947, 72.9625, 'Thane Industrial Area', 'active'),
  ('Wildfire — Sanjay Gandhi Park',     'medium',   'fire',        19.2167, 72.8800, 'SGNP, Borivali',        'monitoring'),
  ('Medical Emergency — Bandra',        'medium',   'medical',     19.0596, 72.8295, 'Bandra West, Mumbai',   'active'),
  ('Road Blockage — Eastern Express',   'low',      'other',       19.1136, 72.8697, 'Eastern Express Hwy',   'active');
*/
