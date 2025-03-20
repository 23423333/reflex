/*
  # Add phone numbers management

  1. New Tables
    - `phone_numbers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `number` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS phone_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  number text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON phone_numbers
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON phone_numbers
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON phone_numbers
    FOR DELETE
    TO authenticated
    USING (true);