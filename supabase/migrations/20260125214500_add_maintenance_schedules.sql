create table vehicle_maintenance_schedules (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid references vehicles(id) on delete cascade not null,
  service_name text not null, -- e.g. "Cambio de Aceite", "Distribución"
  interval_km integer not null, -- e.g. 10000, 50000
  last_service_km integer default 0, -- The mileage at which this was LAST done
  last_service_date date, -- Optional: date it was last done
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table vehicle_maintenance_schedules enable row level security;

create policy "Authenticated users can view schedules"
  on vehicle_maintenance_schedules for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert schedules"
  on vehicle_maintenance_schedules for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update schedules"
  on vehicle_maintenance_schedules for update
  using (auth.role() = 'authenticated');

create policy "Authenticated users can delete schedules"
  on vehicle_maintenance_schedules for delete
  using (auth.role() = 'authenticated');
