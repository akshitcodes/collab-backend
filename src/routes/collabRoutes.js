import { Router } from 'express';
import { createCollab, getCollabs, getFilteredCollabs } from '../controllers/collabController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Collab-related routes
router.get('/',authenticateToken, getCollabs); // GET /collabs
router.get('/filtered', getFilteredCollabs); // GET /collabs/filtered
router.post('/create',authenticateToken, createCollab);

export default router;
