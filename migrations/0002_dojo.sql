create table if not exists dojos (
  id text primary key,
  code_hash text not null unique,
  created_at timestamptz not null default now(),
  week_started bigint not null,
  display_seen boolean not null default false,
  sensei_seen boolean not null default false,
  last_redeem_at bigint not null default 0,
  director_token_hash text,
  director_until bigint not null default 0,
  pin_fails integer not null default 0,
  pin_lock_until bigint not null default 0
);

create table if not exists students (
  id text primary key,
  dojo_id text not null references dojos (id),
  first_name text not null,
  last_initial text not null,
  belt text not null,
  coins integer not null default 0,
  week_coins integer not null default 0,
  archived boolean not null default false,
  day_key text,
  day_coins integer not null default 0,
  last_award_at bigint
);

create index if not exists students_dojo_idx on students (dojo_id);

create table if not exists shop_items (
  id text primary key,
  dojo_id text not null references dojos (id),
  name text not null,
  price integer not null,
  stock integer not null,
  image text not null,
  min_belt text
);

create index if not exists shop_items_dojo_idx on shop_items (dojo_id);

create table if not exists dojo_events (
  id text primary key,
  dojo_id text not null references dojos (id),
  kind text not null,
  at_ms bigint not null,
  student_name text not null,
  detail text not null,
  line text not null,
  coins integer not null default 0,
  celebrate_until bigint not null default 0,
  scene_until bigint not null default 0
);

create index if not exists dojo_events_dojo_idx on dojo_events (dojo_id, at_ms desc);
