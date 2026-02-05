ALTER TABLE appointments
ADD COLUMN instructor_payment_amount NUMERIC(10, 2),
ADD COLUMN instructor_payment_code TEXT;

COMMENT ON COLUMN appointments.instructor_payment_amount IS 'The amount to be paid to the instructor for this specific class snapshot.';
COMMENT ON COLUMN appointments.instructor_payment_code IS 'Optional reference code for the payment rate (e.g., P1, P2).';
