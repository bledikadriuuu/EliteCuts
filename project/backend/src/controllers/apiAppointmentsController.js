import Appointment from '../models/Appointment.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import {
  appointmentCreateSchema,
  appointmentRescheduleSchema,
  appointmentUpdateSchema,
  paginationSchema,
} from '../utils/validation.js';
import { toApiAppointment, ensureSlotAvailable } from '../utils/appointments.js';
import { sendAppointmentNotification } from '../services/telegramService.js';

const findAppointmentByIdentifier = async (id) => {
  if (!id) return null;
  const byObjectId = await Appointment.findById(id);
  if (byObjectId) return byObjectId;
  return Appointment.findOne({ id });
};

const ensureOwner = (appointment, userId) => {
  if (!appointment.customerId || appointment.customerId.toString() !== userId) {
    const error = new Error('Forbidden');
    error.status = 403;
    throw error;
  }
};

export const createAppointment = async (req, res, next) => {
  try {
    const parsed = appointmentCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error('Invalid request');
      error.status = 400;
      throw error;
    }

    const user = await User.findById(req.user.id).lean();
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    const { serviceId, service, date, time, notes } = parsed.data;
    let serviceName = service || '';
    let servicePrice = 0;
    let serviceDuration;

    if (serviceId) {
      const resolvedService = await Service.findOne({ id: serviceId }).lean();
      if (!resolvedService) {
        const error = new Error('Service not found');
        error.status = 404;
        throw error;
      }
      serviceName = resolvedService.name;
      servicePrice = Number(resolvedService.price ?? 0);
      serviceDuration = resolvedService.duration_minutes;
    }

    if (!serviceName) {
      const error = new Error('Service is required');
      error.status = 400;
      throw error;
    }

    await ensureSlotAvailable({ date, time });

    const appointment = await Appointment.create({
      customerId: user._id,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone,
      serviceId: serviceId || undefined,
      serviceName,
      servicePrice,
      serviceDuration,
      date,
      time,
      notes: notes || '',
      status: 'PENDING',
    });

    await sendAppointmentNotification(appointment, 'created');

    res.status(201).json(toApiAppointment(appointment));
  } catch (error) {
    next(error);
  }
};

export const listAppointments = async (req, res, next) => {
  try {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
      const error = new Error('Invalid pagination');
      error.status = 400;
      throw error;
    }

    const { page, limit, sort } = parsed.data;
    const query = req.user.role === 'barber' ? {} : { customerId: req.user.id };

    const sortValue = sort === 'desc' ? { date: -1, time: -1 } : { date: 1, time: 1 };

    const [total, appointments] = await Promise.all([
      Appointment.countDocuments(query),
      Appointment.find(query)
        .sort(sortValue)
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    res.json({
      data: appointments.map(toApiAppointment),
      page,
      limit,
      total,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await findAppointmentByIdentifier(req.params.id);
    if (!appointment) {
      const error = new Error('Appointment not found');
      error.status = 404;
      throw error;
    }

    ensureOwner(appointment, req.user.id);

    const parsed = appointmentUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error('Invalid request');
      error.status = 400;
      throw error;
    }

    let changeType = 'updated';

    if (parsed.data.serviceId) {
      const resolvedService = await Service.findOne({ id: parsed.data.serviceId }).lean();
      if (!resolvedService) {
        const error = new Error('Service not found');
        error.status = 404;
        throw error;
      }

      appointment.serviceId = resolvedService.id;
      appointment.serviceName = resolvedService.name;
      appointment.servicePrice = Number(resolvedService.price ?? 0);
      appointment.serviceDuration = resolvedService.duration_minutes;
    }

    if (parsed.data.date || parsed.data.time) {
      await ensureSlotAvailable({
        date: parsed.data.date ?? appointment.date,
        time: parsed.data.time ?? appointment.time,
        excludeId: appointment._id,
      });

      appointment.date = parsed.data.date ?? appointment.date;
      appointment.time = parsed.data.time ?? appointment.time;
      appointment.status = 'RESCHEDULED';
      changeType = 'rescheduled';
    }

    if (typeof parsed.data.notes === 'string') {
      appointment.notes = parsed.data.notes;
    }

    await appointment.save();
    await sendAppointmentNotification(appointment, changeType);

    res.json(toApiAppointment(appointment));
  } catch (error) {
    next(error);
  }
};

export const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await findAppointmentByIdentifier(req.params.id);
    if (!appointment) {
      const error = new Error('Appointment not found');
      error.status = 404;
      throw error;
    }

    if (req.user.role === 'user') {
      ensureOwner(appointment, req.user.id);
      await appointment.deleteOne();
      await sendAppointmentNotification(appointment, 'deleted');
      return res.status(204).send();
    }

    appointment.status = 'CANCELED';
    await appointment.save();
    await sendAppointmentNotification(appointment, 'canceled');
    return res.json(toApiAppointment(appointment));
  } catch (error) {
    next(error);
  }
};

export const confirmAppointment = async (req, res, next) => {
  try {
    const appointment = await findAppointmentByIdentifier(req.params.id);
    if (!appointment) {
      const error = new Error('Appointment not found');
      error.status = 404;
      throw error;
    }

    appointment.status = 'CONFIRMED';
    await appointment.save();
    await sendAppointmentNotification(appointment, 'confirmed');

    res.json(toApiAppointment(appointment));
  } catch (error) {
    next(error);
  }
};

export const rescheduleAppointment = async (req, res, next) => {
  try {
    const appointment = await findAppointmentByIdentifier(req.params.id);
    if (!appointment) {
      const error = new Error('Appointment not found');
      error.status = 404;
      throw error;
    }

    const parsed = appointmentRescheduleSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error('Invalid request');
      error.status = 400;
      throw error;
    }

    await ensureSlotAvailable({
      date: parsed.data.date,
      time: parsed.data.time,
      excludeId: appointment._id,
    });

    appointment.date = parsed.data.date;
    appointment.time = parsed.data.time;
    appointment.status = 'RESCHEDULED';
    await appointment.save();
    await sendAppointmentNotification(appointment, 'rescheduled');

    res.json(toApiAppointment(appointment));
  } catch (error) {
    next(error);
  }
};

export const completeAppointment = async (req, res, next) => {
  try {
    const appointment = await findAppointmentByIdentifier(req.params.id);
    if (!appointment) {
      const error = new Error('Appointment not found');
      error.status = 404;
      throw error;
    }

    appointment.status = 'COMPLETED';
    await appointment.save();
    await sendAppointmentNotification(appointment, 'completed');

    res.json(toApiAppointment(appointment));
  } catch (error) {
    next(error);
  }
};

export const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await findAppointmentByIdentifier(req.params.id);
    if (!appointment) {
      const error = new Error('Appointment not found');
      error.status = 404;
      throw error;
    }

    if (req.user.role === 'user') {
      const error = new Error('Forbidden');
      error.status = 403;
      throw error;
    }

    await appointment.deleteOne();
    await sendAppointmentNotification(appointment, 'deleted');
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
