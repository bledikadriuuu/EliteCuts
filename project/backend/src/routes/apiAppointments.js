import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createAppointment,
  listAppointments,
  updateAppointment,
  confirmAppointment,
  completeAppointment,
  rescheduleAppointment,
  cancelAppointment,
  deleteAppointment,
} from '../controllers/apiAppointmentsController.js';

const router = Router();

router.use(requireAuth);
router.post('/', requireRole('user'), createAppointment);
router.get('/', listAppointments);
router.patch('/:id', requireRole('user'), updateAppointment);
router.patch('/:id/confirm', requireRole('barber'), confirmAppointment);
router.patch('/:id/complete', requireRole('barber'), completeAppointment);
router.patch('/:id/reschedule', requireRole('barber'), rescheduleAppointment);
router.patch('/:id/cancel', cancelAppointment);
router.delete('/:id', deleteAppointment);

export default router;
