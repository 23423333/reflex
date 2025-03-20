/*
  # Vehicle Subscription System Schema

  1. New Tables
    - `clients`
      - `id` (uuid, primary key)
      - `name` (text)
      - `phone_number` (text)
      - `email` (text)
      - `created_at` (timestamp)
    
    - `vehicles`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key)
      - `car_plate` (text)
      - `subscription_start` (date)
      - `subscription_end` (date)
      - `is_online` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone_number text NOT NULL,
  email text,
  created_at timestamptz DEFAULT now()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id),
  car_plate text NOT NULL UNIQUE,
  subscription_start date NOT NULL DEFAULT CURRENT_DATE,
  subscription_end date NOT NULL,
  is_online boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow full access to authenticated users" ON clients
  FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Allow full access to authenticated users" ON vehicles
  FOR ALL TO authenticated
  USING (true);