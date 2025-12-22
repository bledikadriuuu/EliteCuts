import { z } from 'zod';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timeSchema = z.string().regex(/^\d{2}:\d{2}$/);

export const restAppointmentSchema = z.object({
  service_id: z.string().min(1),
  client_name: z.string().min(1),
  client_email: z.string().email(),
  client_phone: z.string().min(1),
  appointment_date: dateSchema,
  appointment_time: timeSchema,
  notes: z.string().optional(),
  status: z.string().optional(),
});

export const restAppointmentListSchema = z.array(restAppointmentSchema);

export const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(3),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const createBarberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(3),
  password: z.string().min(8),
  setupSecret: z.string().optional(),
});

export const appointmentCreateSchema = z
  .object({
    serviceId: z.string().min(1).optional(),
    service: z.string().min(1).optional(),
    date: dateSchema,
    time: timeSchema,
    notes: z.string().optional(),
  })
  .refine((data) => data.serviceId || data.service, {
    message: 'serviceId or service is required',
    path: ['serviceId'],
  });

export const appointmentRescheduleSchema = z.object({
  date: dateSchema,
  time: timeSchema,
});

export const appointmentUpdateSchema = z.object({
  date: dateSchema.optional(),
  time: timeSchema.optional(),
  serviceId: z.string().min(1).optional(),
  notes: z.string().optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.enum(['asc', 'desc']).default('asc'),
});
