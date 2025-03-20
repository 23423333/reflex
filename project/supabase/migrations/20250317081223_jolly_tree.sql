/*
  # Add ERG number tracking

  1. Changes
    - Add erg_number column to clients table
    - Add index for faster lookups
*/

-- Add ERG number column to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS erg_number text;

-- Create index for ERG number lookups
CREATE INDEX IF NOT EXISTS idx_clients_erg_number ON clients(erg_number);