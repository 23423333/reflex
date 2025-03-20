/*
  # Update clients table and policies

  1. Changes
    - Add preferred_language column to clients table
    - Update bank column default
    - Update RLS policies for better access control

  2. Security
    - Drop and recreate policies with updated permissions
    - Enable public access for better client management
*/

-- Add preferred_language column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'clients' 
    AND column_name = 'preferred_language'
  ) THEN 
    ALTER TABLE clients ADD COLUMN preferred_language text DEFAULT 'en';
  END IF;
END $$;

-- Update bank column default
DO $$
BEGIN
  ALTER TABLE clients ALTER COLUMN bank SET DEFAULT 'Reflex Technologies';
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON clients';
  EXECUTE 'DROP POLICY IF EXISTS "Enable insert access for all users" ON clients';
  EXECUTE 'DROP POLICY IF EXISTS "Enable update for all users" ON clients';
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Create new policies with updated permissions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'clients' AND policyname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users" ON clients
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'clients' AND policyname = 'Enable insert access for all users'
  ) THEN
    CREATE POLICY "Enable insert access for all users" ON clients
      FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'clients' AND policyname = 'Enable update for all users'
  ) THEN
    CREATE POLICY "Enable update for all users" ON clients
      FOR UPDATE
      USING (true);
  END IF;
END $$;