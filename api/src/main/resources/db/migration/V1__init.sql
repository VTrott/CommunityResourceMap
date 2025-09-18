create extension if not exists pg_trgm;

create table if not exists place (
  id uuid primary key,
  name text not null,
  description text,
  website text,
  phone text,
  email text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists category (
  id uuid primary key,
  name text not null unique,
  slug text not null unique
);

create table if not exists place_category (
  place_id uuid not null references place(id) on delete cascade,
  category_id uuid not null references category(id) on delete cascade,
  primary key (place_id, category_id)
);

create table if not exists submission (
  id uuid primary key,
  place_id uuid references place(id) on delete set null,
  payload jsonb not null,
  status text not null default 'pending',
  submitted_by_email text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists idx_place_name_trgm on place using gin (name gin_trgm_ops);
create index if not exists idx_place_coords on place (latitude, longitude);
create index if not exists idx_place_city_state on place (city, state);
create index if not exists idx_submission_status on submission (status);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_place_updated_at on place;
create trigger trg_place_updated_at
before update on place
for each row execute function set_updated_at();
