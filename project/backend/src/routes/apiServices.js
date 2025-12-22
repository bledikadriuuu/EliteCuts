import { Router } from 'express';
import { listServices } from '../controllers/apiServicesController.js';

const router = Router();

router.get('/', listServices);

export default router;
