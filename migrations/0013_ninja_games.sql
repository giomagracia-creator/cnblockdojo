alter table students add column if not exists visit_hours integer not null default 1;

create table if not exists game_runs (
  id text primary key,
  dojo_id text not null,
  student_id text not null,
  game text not null,
  day_key text not null,
  hour_key text not null,
  week_key text not null,
  started_at bigint not null,
  ended_at bigint,
  words integer not null default 0,
  golden integer not null default 0,
  coins integer not null default 0,
  exp integer not null default 0,
  badges text not null default ''
);
