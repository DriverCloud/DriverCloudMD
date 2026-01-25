-- Add maintenance tracking columns to vehicles table
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS current_mileage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_service_mileage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_interval_km INTEGER DEFAULT 10000,
ADD COLUMN IF NOT EXISTS last_service_date DATE;

-- Add comment for documentation
COMMENT ON COLUMN vehicles.current_mileage IS 'Current odometer reading';
COMMENT ON COLUMN vehicles.last_service_mileage IS 'Odometer reading at last service';
COMMENT ON COLUMN vehicles.service_interval_km IS 'Kilometers between required services';
