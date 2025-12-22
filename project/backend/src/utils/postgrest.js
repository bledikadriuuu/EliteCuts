export const parseOrder = (order) => {
  if (!order || typeof order !== 'string') {
    return null;
  }

  const [column, direction] = order.split('.');
  if (!column) {
    return null;
  }

  const sortDirection = direction === 'desc' ? -1 : 1;
  return { [column]: sortDirection };
};

export const toServiceResponse = (service) => ({
  id: service.id,
  name: service.name,
  description: service.description,
  duration_minutes: service.duration_minutes,
  price: service.price,
  created_at: new Date(service.created_at || service.createdAt).toISOString(),
});

export const toRestAppointmentResponse = (appointment) => ({
  id: appointment.id,
  service_id: appointment.serviceId || '',
  client_name: appointment.customerName,
  client_email: appointment.customerEmail,
  client_phone: appointment.customerPhone,
  appointment_date: appointment.date,
  appointment_time: appointment.time,
  notes: appointment.notes || '',
  status: appointment.status ? appointment.status.toLowerCase() : 'pending',
  created_at: new Date(appointment.createdAt || appointment.created_at).toISOString(),
});
