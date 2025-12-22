/*
  # Barbershop Reservation System Database Schema

  ## Overview
  Creates the database structure for a barbershop online reservation system.

  ## New Tables
  
  ### `services`
  - `id` (uuid, primary key) - Unique identifier for each service
  - `name` (text) - Service name (e.g., "Classic Haircut", "Beard Trim")
  - `description` (text) - Detailed description of the service
  - `duration_minutes` (integer) - How long the service takes
  - `price` (numeric) - Service price
  - `created_at` (timestamptz) - When the service was added
  
  ### `appointments`
  - `id` (uuid, primary key) - Unique identifier for each appointment
  - `service_id` (uuid, foreign key) - References the service being booked
  - `client_name` (text) - Customer's full name
  - `client_email` (text) - Customer's email address
  - `client_phone` (text) - Customer's phone number
  - `appointment_date` (date) - Date of the appointment
  - `appointment_time` (time) - Time of the appointment
  - `notes` (text, optional) - Additional notes or requests
  - `status` (text) - Appointment status (pending, confirmed, cancelled)
  - `created_at` (timestamptz) - When the appointment was created

  ## Security
  - Enable RLS on both tables
  - Public read access to services (anyone can view services)
  - Public insert access to appointments (anyone can book)
  - Appointments are publicly readable for simplicity (can be restricted later)
*/

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  notes text DEFAULT '',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Services policies (public read access)
CREATE POLICY "Anyone can view services"
  ON services FOR SELECT
  TO anon
  USING (true);

-- Appointments policies (public can create and view their own)
CREATE POLICY "Anyone can create appointments"
  ON appointments FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view appointments"
  ON appointments FOR SELECT
  TO anon
  USING (true);

-- Insert sample services
INSERT INTO services (name, description, duration_minutes, price) VALUES
  ('Classic Haircut', 'Traditional haircut with styling and consultation', 45, 35.00),
  ('Premium Haircut & Styling', 'Complete haircut with advanced styling and finishing', 60, 50.00),
  ('Beard Trim & Shape', 'Professional beard trimming and shaping', 30, 25.00),
  ('Full Grooming Service', 'Complete haircut and beard grooming package', 90, 70.00),
  ('Hot Towel Shave', 'Traditional straight razor shave with hot towel treatment', 45, 40.00),
  ('Kids Haircut', 'Haircut for children under 12', 30, 25.00)
ON CONFLICT DO NOTHING;