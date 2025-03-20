/*
  # Create scheduled messages table

  1. New Tables
    - `scheduled_messages`
      - `id` (uuid, primary key)
      - `message` (text)
      - `schedule_date` (timestamptz)
      - `message_type` (text)
      - `client_filter` (text)
      - `status` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS scheduled_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  schedule_date timestamptz NOT NULL,
  message_type text NOT NULL,
  client_filter text NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON scheduled_messages
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON scheduled_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON scheduled_messages
    FOR UPDATE
    TO authenticated
    USING (true);