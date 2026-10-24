alter table dojos add column if not exists vault integer not null default 1000;

update dojos set vault = 1000;

delete from achievement_claims;
delete from dojo_undos;
delete from dojo_events;
delete from students;
