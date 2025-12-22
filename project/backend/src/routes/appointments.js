import { Router } from 'express';
import { createAppointments } from '../controllers/appointmentsController.js';

const router = Router();

router.post('/', createAppointments);

export default router;
