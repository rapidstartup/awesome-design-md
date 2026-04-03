-- Agentix Designer: custom design storage
-- Run this in the Supabase SQL editor for project bzldwfwyriwvlyfixmrt

create table if not exists md_designs (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null,
  slug        text        not null,
  base_slug   text,                        -- built-in design used as starting point
  category    text        not null default 'Custom',
  variables   jsonb       not null default '{}',
  is_published boolean    not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- One slug per user
create unique index if not exists md_designs_user_slug_idx
  on md_designs (user_id, slug);

-- RLS: users only touch their own rows
alter table md_designs enable row level security;

create policy "md_designs: select own"
  on md_designs for select using (auth.uid() = user_id);

create policy "md_designs: insert own"
  on md_designs for insert with check (auth.uid() = user_id);

create policy "md_designs: update own"
  on md_designs for update using (auth.uid() = user_id);

create policy "md_designs: delete own"
  on md_designs for delete using (auth.uid() = user_id);

-- Auto-bump updated_at
create or replace function md_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger md_designs_updated_at
  before update on md_designs
  for each row execute procedure md_set_updated_at();
