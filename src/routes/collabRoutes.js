import { Router } from 'express';
import { getCollabs, getFilteredCollabs } from '../controllers/collabController.js';

const router = Router();

// Collab-related routes
router.get('/', getCollabs); // GET /collabs
router.get('/filtered', getFilteredCollabs); // GET /collabs/filtered

export default router;
