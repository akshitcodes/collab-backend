import { Router } from 'express';
import { createCollab, deleteCollab, getCollabs, getFilteredCollabs, getUserCreatedCollabs, getUserJoinedCollabs } from '../controllers/collabController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Collab-related routes
router.get('/',authenticateToken, getCollabs); // GET /collabs
router.get('/filtered', getFilteredCollabs); // GET /collabs/filtered
router.post('/create',authenticateToken, createCollab);
router.get('/user-created',authenticateToken, getUserCreatedCollabs);
router.get('/user-joined',authenticateToken, getUserJoinedCollabs); // Placeholder for user joined collabs
router.delete('/:collab_id',authenticateToken,deleteCollab )

export default router;
