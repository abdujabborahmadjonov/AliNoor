-- =====================================================
-- COMPLETE DATABASE SCHEMA FOR ALINOOR PLATFORM
-- =====================================================
--
-- WARNING — this file has drifted from the live project. The running database
-- differs in ways the app code depends on, so do not treat the statements
-- below as the source of truth for the deployed environment:
--
--   * articles.status uses 'published', not 'approved' (and the select policy
--     and every query in app/ filter on 'published')
--   * the counter columns are views_count / likes_count, not views / likes
--   * articles has an author_name column (the byline shown on essays)
--   * profiles has phone and age columns — the profile-completeness gate in
--     app/(auth)/login and app/(auth)/complete-profile requires both
--   * inserting an article requires author_id = auth.uid()
--
-- Section 8 below matches live and is required: without user_data every
-- cross-device sync silently no-ops.

-- =====================================================
-- 1. PROFILES TABLE (USER INFORMATION)
-- =====================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  country text,
  birthdate date,
  bio text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

alter table public.profiles enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- =====================================================
-- 2. ARTICLES TABLE (WITH TOPICS + VIEWS)
-- =====================================================
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  cover_image text,
  topic text,
  subtopic text,
  status text check (status in ('draft', 'pending', 'approved')) default 'draft',
  author_email text not null,
  views integer default 0,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

alter table public.articles enable row level security;

-- Articles policies
create policy "Anyone can view approved articles"
  on public.articles for select
  using (status = 'approved');

create policy "Authors can view their own articles"
  on public.articles for select
  using (author_email = auth.jwt() ->> 'email');

create policy "Authenticated users can insert articles"
  on public.articles for insert
  with check (auth.role() = 'authenticated');

create policy "Authors can update their own articles"
  on public.articles for update
  using (author_email = auth.jwt() ->> 'email');

create policy "Authors can delete their own articles"
  on public.articles for delete
  using (author_email = auth.jwt() ->> 'email');

-- =====================================================
-- 3. ARTICLE VIEWS TABLE (TRACK PER USER)
-- =====================================================
create table if not exists public.article_views (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  viewed_at timestamp with time zone default timezone('utc', now()),
  unique (article_id, user_id)
);

alter table public.article_views enable row level security;

create policy "Users can insert their own views"
  on public.article_views for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own views"
  on public.article_views for select
  using (auth.uid() = user_id);

-- =====================================================
-- 4. ARTICLE LIKES TABLE
-- =====================================================
create table if not exists public.article_likes (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()),
  unique (article_id, user_id)
);

alter table public.article_likes enable row level security;

create policy "Users can insert their own likes"
  on public.article_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own likes"
  on public.article_likes for delete
  using (auth.uid() = user_id);

create policy "Anyone can view likes"
  on public.article_likes for select
  using (true);

-- =====================================================
-- 5. BOOKMARKS TABLE
-- =====================================================
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()),
  unique (article_id, user_id)
);

alter table public.bookmarks enable row level security;

create policy "Users can manage their own bookmarks"
  on public.bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================================================
-- 6. FUNCTION: INCREMENT ARTICLE VIEWS
-- =====================================================
create or replace function public.increment_article_views(
  p_article_id uuid
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.article_views (article_id, user_id)
  values (p_article_id, auth.uid())
  on conflict (article_id, user_id) do nothing;

  update public.articles
  set views = (
    select count(*)
    from public.article_views
    where article_id = p_article_id
  )
  where id = p_article_id;
end;
$$;

-- =====================================================
-- 7. FUNCTION: TOGGLE ARTICLE LIKE
-- =====================================================
create or replace function public.toggle_article_like(
  p_article_id uuid
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_exists boolean;
  v_liked boolean;
begin
  -- Check if like exists
  select exists(
    select 1 from public.article_likes
    where article_id = p_article_id and user_id = auth.uid()
  ) into v_exists;

  if v_exists then
    -- Unlike
    delete from public.article_likes
    where article_id = p_article_id and user_id = auth.uid();
    v_liked := false;
  else
    -- Like
    insert into public.article_likes (article_id, user_id)
    values (p_article_id, auth.uid());
    v_liked := true;
  end if;

  -- Update likes count
  update public.articles
  set likes = (
    select count(*)
    from public.article_likes
    where article_id = p_article_id
  )
  where id = p_article_id;

  return v_liked;
end;
$$;

-- =====================================================
-- 8. INDEXES FOR PERFORMANCE
-- =====================================================
create index if not exists idx_articles_status on public.articles(status);
create index if not exists idx_articles_author on public.articles(author_email);
create index if not exists idx_articles_topic on public.articles(topic);
create index if not exists idx_articles_created on public.articles(created_at desc);
create index if not exists idx_article_views_article on public.article_views(article_id);
create index if not exists idx_article_likes_article on public.article_likes(article_id);
create index if not exists idx_bookmarks_user on public.bookmarks(user_id);

-- =====================================================
-- 9. TRIGGER: UPDATE UPDATED_AT TIMESTAMP
-- =====================================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on public.articles
  for each row
  execute function public.handle_updated_at();

create trigger set_profile_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- =====================================================
-- 8. USER_DATA TABLE (CROSS-DEVICE SYNC)
-- =====================================================
-- One JSON blob per key per user, mirroring the localStorage keys the planner
-- writes: alinoor_settings, alinoor_tasks, alinoor_habits, alinoor_habit_logs,
-- alinoor_books, alinoor_arabic_stars.
--
-- The composite primary key is load-bearing: lib/store.ts upserts with
-- onConflict 'user_id,key', and a surrogate id here would make every save
-- append a new row instead of updating the existing one.
create table if not exists public.user_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null,
  updated_at timestamptz default now(),
  primary key (user_id, key)
);

alter table public.user_data enable row level security;

create policy "Users can read their own data"
  on public.user_data for select
  using (auth.uid() = user_id);

create policy "Users can write their own data"
  on public.user_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own data"
  on public.user_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own data"
  on public.user_data for delete
  using (auth.uid() = user_id);
