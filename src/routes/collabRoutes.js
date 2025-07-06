import { Router } from 'express';
import { createCollab, getCollabs, getFilteredCollabs } from '../controllers/collabController.js';

const router = Router();

// Collab-related routes
router.get('/', getCollabs); // GET /collabs
router.get('/filtered', getFilteredCollabs); // GET /collabs/filtered
router.post('/create', createCollab);

export default router;
