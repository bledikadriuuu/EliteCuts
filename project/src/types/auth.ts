export type UserRole = 'user' | 'barber';

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  createdAt?: string | null;
}

export interface AppointmentItem {
  _id: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  serviceId: string | null;
  price: number;
  duration: number | null;
  date: string;
  time: string;
  status: string;
  notes?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
