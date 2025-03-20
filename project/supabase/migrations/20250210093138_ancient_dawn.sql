/*
  # Fix RLS policies for clients and vehicles tables

  1. Changes
    - Update RLS policies to allow proper access for authenticated and anon users
    - Enable public access for essential operations
    
  2. Security
    - Maintain basic security while allowing necessary operations
    - Allow read access to public data
    - Allow insert operations for new clients
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON clients;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON vehicles;

-- Create new policies for clients table
CREATE POLICY "Enable read access for all users" ON clients
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert access for all users" ON clients
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON clients
    FOR UPDATE
    USING (true);

-- Create new policies for vehicles table
CREATE POLICY "Enable read access for all users" ON vehicles
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert access for all users" ON vehicles
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON vehicles
    FOR UPDATE
    USING (true);