alter table fight_queue add column if not exists fighter text not null default '';
alter table fight_queue add column if not exists locked_at bigint not null default 0;
