alter table dojos add column if not exists last_mined_at bigint not null default 0;

alter table students add column if not exists archived_at bigint;

update dojos set last_mined_at = (extract(epoch from now()) * 1000)::bigint where last_mined_at = 0;

update students set archived_at = (extract(epoch from now()) * 1000)::bigint where archived = true and archived_at is null;
