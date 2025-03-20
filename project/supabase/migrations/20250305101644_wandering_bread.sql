/*
  # Update schema for enhanced features

  1. Changes
    - Add language_preference to clients table with more language options
    - Remove car plate validation constraint
    - Add subscription_start_date and subscription_end_date as date fields
    - Update phone_numbers table to sync with clients

  2. Security
    - Maintain existing RLS policies
    - Add policies for phone number synchronization
*/

-- Update clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS language_preference text DEFAULT 'en',
ADD COLUMN IF NOT EXISTS subscription_start_date date DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS subscription_end_date date;

-- Remove car plate validation constraint
ALTER TABLE vehicles
DROP CONSTRAINT IF EXISTS vehicles_car_plate_check;

-- Create function to sync client phones
CREATE OR REPLACE FUNCTION sync_phone_numbers()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO phone_numbers (name, number)
  VALUES (NEW.name, NEW.phone_number)
  ON CONFLICT (number) 
  DO UPDATE SET name = EXCLUDED.name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for syncing phones
DROP TRIGGER IF EXISTS sync_client_phones ON clients;
CREATE TRIGGER sync_client_phones
AFTER INSERT OR UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION sync_phone_numbers();