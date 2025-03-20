/*
  # Update clients and vehicles schema

  1. Changes
    - Add bank field to clients table
    - Add default values for subscription dates
    - Add constraints for required fields

  2. Security
    - Maintain existing RLS policies
*/

-- Add bank field to clients if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'bank'
  ) THEN
    ALTER TABLE clients ADD COLUMN bank text NOT NULL DEFAULT 'Individual';
  END IF;
END $$;

-- Add constraints to ensure data integrity
ALTER TABLE clients 
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN phone_number SET NOT NULL;

ALTER TABLE vehicles 
  ALTER COLUMN car_plate SET NOT NULL,
  ALTER COLUMN subscription_start SET DEFAULT CURRENT_DATE,
  ALTER COLUMN subscription_end SET NOT NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_bank ON clients(bank);
CREATE INDEX IF NOT EXISTS idx_vehicles_car_plate ON vehicles(car_plate);
CREATE INDEX IF NOT EXISTS idx_clients_phone_number ON clients(phone_number);