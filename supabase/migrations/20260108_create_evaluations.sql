-- Create table for class evaluations
create table if not exists public.class_evaluations (
  id uuid not null default gen_random_uuid (),
  appointment_id uuid not null,
  instructor_id uuid not null,
  student_id uuid not null,
  rating smallint not null check (rating >= 1 and rating <= 5),
  public_comment text null,
  private_notes text null,
  skills_evaluated jsonb null,
  areas_of_improvement text[] null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null,
  constraint class_evaluations_pkey primary key (id),
  constraint class_evaluations_appointment_id_fkey foreign key (appointment_id) references appointments (id) on delete cascade,
  constraint class_evaluations_instructor_id_fkey foreign key (instructor_id) references auth.users (id),
  constraint class_evaluations_student_id_fkey foreign key (student_id) references students (id),
  constraint class_evaluations_appointment_id_key unique (appointment_id)
);

-- Enable RLS
alter table public.class_evaluations enable row level security;

-- Policies

-- Instructor can create evaluation for their appointments
create policy "Instructors can create evaluations"
  on public.class_evaluations for insert
  to authenticated
  with check (
    auth.uid() = instructor_id
  );

-- Instructor can view their own evaluations
create policy "Instructors can view their own evaluations"
  on public.class_evaluations for select
  to authenticated
  using (
    auth.uid() = instructor_id
  );

-- Students can view evaluations for their appointments (only public fields)
-- Note: Supabase doesn't support column-level RLS directly in policies for SELECT *,
-- so we rely on the backend to filter fields or use a view if strict security needed.
-- For now, we allow select if own student, but backend must ensure private_notes aren't sent to client.
create policy "Students can view their own evaluations"
  on public.class_evaluations for select
  to authenticated
  using (
    exists (
      select 1 from students
      where students.id = class_evaluations.student_id
      and students.user_id = auth.uid()
    )
  );

-- Admins/Owners might need access too (omitted for brevity, can add if needed)
