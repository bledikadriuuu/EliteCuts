export interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  created_at: string;
}

export interface Appointment {
  id?: string;
  service_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
  status?: string;
  created_at?: string;
}
