delete from students
where id in (
  select s.id
  from students s
  join students o
    on s.dojo_id = o.dojo_id
   and lower(s.first_name) = lower(o.first_name)
   and s.last_initial = o.last_initial
   and s.id <> o.id
   and (s.coins < o.coins or (s.coins = o.coins and s.id > o.id))
);

create unique index if not exists students_one_name
  on students (dojo_id, lower(first_name), last_initial);
