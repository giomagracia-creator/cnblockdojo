create table if not exists achievements (
  id text primary key,
  dojo_id text not null references dojos (id),
  cadence text not null,
  name text not null,
  coins integer not null,
  image text not null
);

create index if not exists achievements_dojo_idx on achievements (dojo_id);

create table if not exists achievement_claims (
  id text primary key,
  dojo_id text not null references dojos (id),
  achievement_id text not null,
  student_id text not null,
  period_key text not null,
  at_ms bigint not null
);

create unique index if not exists achievement_claims_once on achievement_claims (achievement_id, student_id, period_key);

insert into achievements (id, dojo_id, cadence, name, coins, image)
select d.id || ':a-code', d.id, 'daily', 'Code for 40 minutes', 40, '/art/achievements/code.png'
from dojos d
where not exists (select 1 from achievements a where a.dojo_id = d.id);

insert into achievements (id, dojo_id, cadence, name, coins, image)
select d.id || ':a-friend', d.id, 'weekly', 'Bring a friend', 100, '/art/achievements/friend.png'
from dojos d
where not exists (select 1 from achievements a where a.dojo_id = d.id and a.cadence = 'weekly');

insert into achievements (id, dojo_id, cadence, name, coins, image)
select d.id || ':a-print-friend', d.id, 'weekly', 'Give a 3D print to a friend', 10, '/art/achievements/print.png'
from dojos d
where not exists (select 1 from achievements a where a.id = d.id || ':a-print-friend');

insert into achievements (id, dojo_id, cadence, name, coins, image)
select d.id || ':a-print-teacher', d.id, 'weekly', 'Give a 3D print to your teacher', 30, '/art/achievements/teacher.png'
from dojos d
where not exists (select 1 from achievements a where a.id = d.id || ':a-print-teacher');
