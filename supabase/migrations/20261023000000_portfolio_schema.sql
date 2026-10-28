create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- First account ever created (via Users > Add user; public sign-up is disabled) becomes admin.
create or replace function public.assign_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_xact_lock(739125001);
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
revoke execute on function public.assign_first_admin() from public, anon, authenticated;
create trigger on_auth_user_created_first_admin after insert on auth.users
  for each row execute function public.assign_first_admin();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- Singleton site settings
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  brand_name text not null default 'Chozen',
  hero_eyebrow text not null default '',
  hero_name text not null default 'Chozen',
  hero_title text not null default '',
  hero_intro text not null default '',
  hero_image text,
  primary_cta_label text not null default 'Explore My Work',
  primary_cta_href text not null default '#projects',
  secondary_cta_label text not null default 'Contact Me',
  secondary_cta_href text not null default '#contact',
  about_heading text not null default 'About me',
  about_intro text not null default '',
  contact_heading text not null default 'Let''s work together',
  contact_text text not null default '',
  contact_email text,
  whatsapp_number text,
  contact_cta_label text not null default 'Send an email',
  footer_text text not null default '',
  meta_title text not null default 'Chozen — Portfolio',
  meta_description text not null default 'Projects, source code, classes and e-books by Chozen.',
  show_about boolean not null default true,
  show_stats boolean not null default true,
  show_projects boolean not null default true,
  show_source_code boolean not null default true,
  show_classes boolean not null default true,
  show_ebooks boolean not null default true,
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon, authenticated;
grant update, insert on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "Public read settings" on public.site_settings for select to anon, authenticated using (true);
create policy "Admin update settings" on public.site_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admin insert settings" on public.site_settings for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create trigger touch_site_settings before update on public.site_settings for each row execute function public.touch_updated_at();

insert into public.site_settings (id, hero_eyebrow, hero_title, hero_intro, hero_image, about_intro, contact_text, footer_text)
values (1, 'Hi, I''m Chozen', 'Your professional title goes here',
 'A short introduction about who you are and what you build. Edit this from the admin dashboard.',
 null,
 'Write a short paragraph about your background and goals here.',
 'Have a project, a question or an idea? Reach out through any of the channels below.',
 'Built with care by Chozen.');

-- Generic content tables
create table public.about_blocks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  icon text,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stats (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'stat' check (kind in ('stat','skill')),
  label text not null,
  value text not null default '',
  description text not null default '',
  icon text,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text not null default '',
  description text not null default '',
  cover_image text,
  gallery text[] not null default '{}',
  technologies text[] not null default '{}',
  category text,
  live_url text,
  source_url text,
  featured boolean not null default false,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.source_code (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  cover_image text,
  category text,
  repo_url text,
  demo_url text,
  download_file text,
  price_label text,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  thumbnail text,
  category text,
  resource_url text,
  download_file text,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ebooks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  cover_image text,
  category text,
  resource_url text,
  download_file text,
  price_label text,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  label text not null default '',
  url text not null,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['about_blocks','stats','projects','source_code','classes','ebooks','social_links'] loop
    execute format('grant select on public.%I to anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "Public read published" on public.%I for select to anon using (published = true)', t);
    execute format('create policy "Auth read published or admin all" on public.%I for select to authenticated using (published = true or public.has_role(auth.uid(),''admin''))', t);
    execute format('create policy "Admin insert" on public.%I for insert to authenticated with check (public.has_role(auth.uid(),''admin''))', t);
    execute format('create policy "Admin update" on public.%I for update to authenticated using (public.has_role(auth.uid(),''admin'')) with check (public.has_role(auth.uid(),''admin''))', t);
    execute format('create policy "Admin delete" on public.%I for delete to authenticated using (public.has_role(auth.uid(),''admin''))', t);
    execute format('create trigger touch_%I before update on public.%I for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

-- Storage policies
create policy "Public read portfolio media" on storage.objects for select to anon, authenticated using (bucket_id in ('images','files'));
create policy "Admin upload media" on storage.objects for insert to authenticated with check (bucket_id in ('images','files') and public.has_role(auth.uid(),'admin'));
create policy "Admin update media" on storage.objects for update to authenticated using (bucket_id in ('images','files') and public.has_role(auth.uid(),'admin'));
create policy "Admin delete media" on storage.objects for delete to authenticated using (bucket_id in ('images','files') and public.has_role(auth.uid(),'admin'));