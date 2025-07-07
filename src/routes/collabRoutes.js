import { Router } from 'express';
import { createCollab, getCollabs, getFilteredCollabs, getUserCreatedCollabs } from '../controllers/collabController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Collab-related routes
router.get('/',authenticateToken, getCollabs); // GET /collabs
router.get('/filtered', getFilteredCollabs); // GET /collabs/filtered
router.post('/create',authenticateToken, createCollab);
router.get('/user-created',authenticateToken, getUserCreatedCollabs);
router.get('/user-joined',authenticateToken, getUserCreatedCollabs); // Placeholder for user joined collabs

export default router;
