/*
  # Add import tracking and history

  1. New Tables
    - `import_history`
      - `id` (uuid, primary key)
      - `filename` (text)
      - `bank` (text)
      - `status` (text)
      - `total_records` (integer)
      - `successful_imports` (integer)
      - `failed_imports` (integer)
      - `error_log` (jsonb)
      - `created_at` (timestamptz)
      - `created_by` (uuid)

  2. Changes
    - Add import_id to clients table to track which import created them
    - Add import tracking fields

  3. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create import_history table
CREATE TABLE IF NOT EXISTS import_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  bank text NOT NULL,
  status text NOT NULL DEFAULT 'processing',
  total_records integer DEFAULT 0,
  successful_imports integer DEFAULT 0,
  failed_imports integer DEFAULT 0,
  error_log jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Add import tracking to clients
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS import_id uuid REFERENCES import_history(id),
ADD COLUMN IF NOT EXISTS import_row_number integer;

-- Enable RLS
ALTER TABLE import_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON import_history
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON import_history
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON import_history
    FOR UPDATE
    TO authenticated
    USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_import_history_bank ON import_history(bank);
CREATE INDEX IF NOT EXISTS idx_import_history_status ON import_history(status);
CREATE INDEX IF NOT EXISTS idx_clients_import_id ON clients(import_id);