-- H2-compatible schema initialization
create table if not exists place (
  id uuid primary key,
  name varchar(255) not null,
  description text,
  website varchar(500),
  phone varchar(50),
  email varchar(255),
  address_line1 varchar(255),
  address_line2 varchar(255),
  city varchar(100),
  state varchar(50),
  postal_code varchar(20),
  latitude decimal(9,6),
  longitude decimal(9,6),
  status varchar(50) not null default 'active',
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp,
  deleted_at timestamp
);

create table if not exists category (
  id uuid primary key,
  name varchar(255) not null unique,
  slug varchar(255) not null unique
);

create table if not exists place_category (
  place_id uuid not null references place(id) on delete cascade,
  category_id uuid not null references category(id) on delete cascade,
  primary key (place_id, category_id)
);

create table if not exists submission (
  id uuid primary key,
  place_id uuid references place(id) on delete set null,
  payload clob not null,
  status varchar(50) not null default 'pending',
  submitted_by_email varchar(255),
  created_at timestamp not null default current_timestamp,
  reviewed_at timestamp
);

-- H2-compatible indexes
create index if not exists idx_place_name on place (name);
create index if not exists idx_place_coords on place (latitude, longitude);
create index if not exists idx_place_city_state on place (city, state);
create index if not exists idx_submission_status on submission (status);
