create table if not exists dojo_undos (
  id text primary key,
  dojo_id text not null references dojos (id),
  at_ms bigint not null,
  kind text not null,
  student_id text not null,
  item_id text,
  amount integer not null,
  event_id text not null,
  label text not null,
  action_day text,
  prev_last_award bigint,
  prev_last_redeem bigint not null default 0
);

create index if not exists dojo_undos_idx on dojo_undos (dojo_id, at_ms desc);
