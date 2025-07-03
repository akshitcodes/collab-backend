import { Router } from 'express';
import { home } from '../controllers/collabController.js';
import { healthcheck } from '../controllers/homeController.js';

const router = Router();

router.get('/', home);
router.get('/healthcheck', healthcheck);

export default router;
