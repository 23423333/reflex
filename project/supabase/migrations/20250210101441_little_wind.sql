/*
  # Create admin user

  1. Changes
    - Create initial admin user with email/password login
  
  2. Security
    - User will be created in auth.users table
    - Password will be hashed automatically
*/

-- Create admin user if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@reflextechnologies.com'
  ) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@reflextechnologies.com',
      crypt('Admin123!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  END IF;
END $$;