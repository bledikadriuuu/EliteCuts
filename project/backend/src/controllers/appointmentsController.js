import Appointment from '../models/Appointment.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import { restAppointmentListSchema } from '../utils/validation.js';
import { toRestAppointmentResponse } from '../utils/postgrest.js';
import { normalizeStatus, ensureSlotAvailable } from '../utils/appointments.js';
import { sendAppointmentNotification } from '../services/telegramService.js';

export const createAppointments = async (req, res, next) => {
  try {
    const raw = req.body;
    const payload = Array.isArray(raw) ? raw : [raw];
    const parsed = restAppointmentListSchema.safeParse(payload);

    if (!parsed.success) {
      const error = new Error('Invalid request');
      error.status = 400;
      error.details = parsed.error.flatten();
      error.code = 'PGRST102';
      throw error;
    }

    const serviceIds = [...new Set(parsed.data.map((item) => item.service_id))];
    const services = await Service.find({ id: { $in: serviceIds } }).lean();
    if (services.length !== serviceIds.length) {
      const error = new Error('Invalid service_id');
      error.status = 400;
      error.code = 'PGRST116';
      throw error;
    }

    const serviceMap = new Map(services.map((service) => [service.id, service]));

    const created = [];
    for (const item of parsed.data) {
      await ensureSlotAvailable({ date: item.appointment_date, time: item.appointment_time });
      const service = serviceMap.get(item.service_id);
      const user = await User.findOne({ email: item.client_email }).lean();
      const appointment = await Appointment.create({
        customerId: user?._id,
        customerName: item.client_name,
        customerEmail: item.client_email,
        customerPhone: item.client_phone,
        serviceId: item.service_id,
        serviceName: service?.name || 'Service',
        servicePrice: Number(service?.price ?? 0),
        serviceDuration: service?.duration_minutes,
        date: item.appointment_date,
        time: item.appointment_time,
        notes: item.notes || '',
        status: normalizeStatus(item.status),
      });
      created.push(appointment);
      await sendAppointmentNotification(appointment, 'created');
    }

    res.status(201).json(created.map(toRestAppointmentResponse));
  } catch (error) {
    next(error);
  }
};
