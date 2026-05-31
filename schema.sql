-- =============================================
--  VíaMedellín – Schema de base de datos
--  Ejecutar en: Supabase → SQL Editor
-- =============================================

-- Extensión UUID
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
--  TABLA: perfiles
--  Se crea automáticamente al registrar usuario
-- ─────────────────────────────────────────────
create table if not exists public.perfiles (
  id          uuid references auth.users on delete cascade primary key,
  nombre      text not null default '',
  apellido    text not null default '',
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────────
--  TABLA: reportes
-- ─────────────────────────────────────────────
create table if not exists public.reportes (
  id              uuid default uuid_generate_v4() primary key,
  usuario_id      uuid references auth.users on delete cascade not null,
  tipo_daño       text not null,
  nivel_urgencia  text not null check (nivel_urgencia in ('alta', 'media', 'baja')),
  latitud         double precision not null,
  longitud        double precision not null,
  direccion       text default '',
  descripcion     text default '',
  foto_url        text default '',
  estado          text not null default 'pendiente'
                  check (estado in ('pendiente', 'urgente', 'resuelto')),
  created_at      timestamptz default now()
);

-- ─────────────────────────────────────────────
--  ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table public.perfiles  enable row level security;
alter table public.reportes  enable row level security;

-- Perfiles: cualquiera puede ver, solo el dueño actualiza
create policy "Ver todos los perfiles"
  on public.perfiles for select using (true);

create policy "Actualizar perfil propio"
  on public.perfiles for update using (auth.uid() = id);

-- Reportes: todos pueden ver, solo autenticados insertan/actualizan los suyos
create policy "Ver todos los reportes"
  on public.reportes for select using (true);

create policy "Insertar reporte propio"
  on public.reportes for insert
  with check (auth.uid() = usuario_id);

create policy "Actualizar reporte propio"
  on public.reportes for update
  using (auth.uid() = usuario_id);

-- ─────────────────────────────────────────────
--  TRIGGER: crear perfil al registrar usuario
-- ─────────────────────────────────────────────
create or replace function public.crear_perfil_usuario()
returns trigger as $$
begin
  insert into public.perfiles (id, nombre, apellido)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre',   ''),
    coalesce(new.raw_user_meta_data ->> 'apellido', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.crear_perfil_usuario();

-- ─────────────────────────────────────────────
--  STORAGE: bucket para fotos de reportes
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fotos-reportes',
  'fotos-reportes',
  true,
  5242880,   -- 5 MB máximo
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

create policy "Ver fotos públicas"
  on storage.objects for select
  using (bucket_id = 'fotos-reportes');

create policy "Subir foto autenticado"
  on storage.objects for insert
  with check (bucket_id = 'fotos-reportes' and auth.role() = 'authenticated');

create policy "Eliminar foto propia"
  on storage.objects for delete
  using (bucket_id = 'fotos-reportes' and auth.uid()::text = (storage.foldername(name))[1]);
