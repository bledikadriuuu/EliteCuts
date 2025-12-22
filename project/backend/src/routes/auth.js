import { Router } from 'express';
import { signup, login, createBarber, me } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/create-barber', createBarber);
router.get('/me', requireAuth, me);

export default router;
