import Appointment from '../models/Appointment.js';

const statusMap = {
  pending: 'PENDING',
  confirmed: 'CONFIRMED',
  rescheduled: 'RESCHEDULED',
  canceled: 'CANCELED',
  cancelled: 'CANCELED',
  completed: 'COMPLETED',
};

export const normalizeStatus = (status) => {
  if (!status) return 'PENDING';
  const normalized = statusMap[String(status).toLowerCase()];
  return normalized || 'PENDING';
};

export const ensureSlotAvailable = async ({ date, time, excludeId }) => {
  ensureWithinBusinessHours(time);
  ensureNotPast(date, time);
  const query = {
    date,
    time,
    status: { $ne: 'CANCELED' },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const exists = await Appointment.exists(query);
  if (exists) {
    const error = new Error('Time slot already booked');
    error.status = 409;
    throw error;
  }
};

export const ensureWithinBusinessHours = (time) => {
  if (!time) {
    return;
  }

  const [hour, minute] = time.split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    const error = new Error('Invalid time format');
    error.status = 400;
    throw error;
  }

  if (hour < 9 || hour > 20 || (hour === 20 && minute > 0)) {
    const error = new Error('Outside business hours');
    error.status = 400;
    throw error;
  }
};

export const ensureNotPast = (date, time) => {
  if (!date || !time) {
    return;
  }

  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const slot = new Date(year, month - 1, day, hour, minute, 0, 0);
  const now = new Date();

  if (slot <= now) {
    const error = new Error('Cannot book a past time');
    error.status = 400;
    throw error;
  }
};

export const toApiAppointment = (appointment) => ({
  _id: appointment._id.toString(),
  customerId: appointment.customerId ? appointment.customerId.toString() : null,
  customerName: appointment.customerName,
  customerEmail: appointment.customerEmail,
  customerPhone: appointment.customerPhone,
  service: appointment.serviceName,
  serviceId: appointment.serviceId || null,
  price: appointment.servicePrice ?? 0,
  duration: appointment.serviceDuration ?? null,
  date: appointment.date,
  time: appointment.time,
  status: appointment.status,
  notes: appointment.notes || '',
  createdAt: appointment.createdAt ? appointment.createdAt.toISOString() : null,
  updatedAt: appointment.updatedAt ? appointment.updatedAt.toISOString() : null,
});
