alter table students add column if not exists exp integer not null default 0;

alter table shop_items add column if not exists currency text not null default 'coins';

alter table dojos add column if not exists phone_code text;
alter table dojos add column if not exists phone_hour text;
alter table dojos add column if not exists phone_zone text;

create table if not exists exp_claims (
  dojo_id text not null references dojos (id),
  student_id text not null,
  item_id text not null,
  at_ms bigint not null,
  primary key (dojo_id, student_id, item_id)
);
