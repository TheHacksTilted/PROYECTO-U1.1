-- Crear tabla de tareas
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (Seguridad a Nivel de Fila)
alter table public.tasks enable row level security;

-- Políticas de Seguridad (RLS)
-- 1. Los usuarios solo pueden ver sus propias tareas
create policy "Los usuarios pueden ver sus propias tareas."
  on public.tasks for select
  using ( auth.uid() = user_id );

-- 2. Los usuarios solo pueden crear tareas para ellos mismos
create policy "Los usuarios pueden insertar sus propias tareas."
  on public.tasks for insert
  with check ( auth.uid() = user_id );

-- 3. Los usuarios solo pueden actualizar sus propias tareas
create policy "Los usuarios pueden actualizar sus propias tareas."
  on public.tasks for update
  using ( auth.uid() = user_id );

-- 4. Los usuarios solo pueden eliminar sus propias tareas
create policy "Los usuarios pueden eliminar sus propias tareas."
  on public.tasks for delete
  using ( auth.uid() = user_id );

-- Habilitar actualizaciones en tiempo real (Realtime) para la tabla public.tasks
begin;
  -- remove the supabase_realtime publication
  drop publication if exists supabase_realtime;

  -- re-create the supabase_realtime publication with no tables
  create publication supabase_realtime;
commit;

-- add tasks to the publication
alter publication supabase_realtime add table public.tasks;
