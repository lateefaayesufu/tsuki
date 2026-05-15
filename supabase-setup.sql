
create table if not exists guest_words (
  id         bigint generated always as identity primary key,
  word       text not null check (
               length(trim(word)) between 1 and 20
               and trim(word) not like '% %'  
             ),
  created_at timestamptz default now() not null
);


create index if not exists guest_words_created_at_idx
  on guest_words (created_at desc);


alter table guest_words enable row level security;


create policy "Public read"
  on guest_words for select
  using (true);


create policy "Public insert"
  on guest_words for insert
  with check (
    length(trim(word)) between 1 and 20
    and trim(word) not like '% %'
  );


alter publication supabase_realtime add table guest_words;

insert into guest_words (word) values
  ('stillness'), ('impossible'), ('warm'), ('quiet'),
  ('月'), ('found'), ('again'), ('breathe'),
  ('unexpected'), ('home')
on conflict do nothing;


create table if not exists visitor_stamps (
  id         bigint generated always as identity primary key,
  stamp      text not null,
  created_at timestamptz default now() not null
);

alter table visitor_stamps enable row level security;

create policy "Public insert"
  on visitor_stamps for insert
  with check (true);

create policy "Public read"
  on visitor_stamps for select
  using (true);

create table if not exists contact_messages (
  id           bigint generated always as identity primary key,
  sender_name  text,
  sender_email text,
  message_kind text,
  message      text not null,
  created_at   timestamptz default now() not null
);

alter table contact_messages enable row level security;

create policy "Public insert"
  on contact_messages for insert
  with check (length(trim(message)) > 0);

create policy "Public read"
  on contact_messages for select
  using (true);