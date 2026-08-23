-- Moonlit story universe, children, characters, episodes, and lore.

create table if not exists children (
  id text primary key,
  user_id text not null,
  name text not null,
  age integer not null,
  interests text not null default '',
  humor_style text not null default '',
  default_duration_min integer not null default 10,
  dislikes text not null default '',
  vocabulary_level text not null default 'age-typical',
  created_at timestamptz not null default now()
);
create index if not exists children_user_id_idx on children (user_id);

create table if not exists worlds (
  id text primary key,
  user_id text not null,
  child_id text not null,
  title text not null,
  mode text not null,
  planned_chapters integer,
  duration_min integer not null default 10,
  mood_funny integer not null default 3,
  mood_adventure integer not null default 3,
  mood_mystery integer not null default 2,
  premise text not null default '',
  setting text not null default '',
  parent_objectives text not null default '',
  parent_avoids text not null default '',
  next_episode integer not null default 1,
  last_summary text not null default '',
  last_hook text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists worlds_user_id_idx on worlds (user_id);

create table if not exists characters (
  id text primary key,
  user_id text not null,
  world_id text not null,
  name text not null,
  role text not null,
  appearance text not null default '',
  personality text not null default '',
  strengths text not null default '',
  flaws text not null default '',
  speech_style text not null default '',
  catchphrase text not null default '',
  fears text not null default '',
  voice_id text not null default 'eve',
  is_canon boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists characters_world_id_idx on characters (world_id);

create table if not exists world_state (
  world_id text primary key,
  user_id text not null,
  locations jsonb not null default '[]',
  possessions jsonb not null default '[]',
  relationships jsonb not null default '[]',
  unresolved_mysteries jsonb not null default '[]',
  running_jokes jsonb not null default '[]',
  promises jsonb not null default '[]',
  active_arcs jsonb not null default '[]',
  canon_facts jsonb not null default '[]',
  episode_type_history jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

create table if not exists episodes (
  id text primary key,
  user_id text not null,
  world_id text not null,
  episode_number integer not null,
  title text not null,
  status text not null default 'ready',
  duration_min integer not null,
  script jsonb not null,
  book_text text not null default '',
  parent_summary text not null default '',
  director_plan jsonb,
  word_count integer not null default 0,
  chosen_options jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists episodes_world_id_idx on episodes (world_id);
