import { Router } from "express";
import { loginUser, logoutUser, registerUser,joinCollab, leaveCollab } from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();
router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/logout', authenticateToken,logoutUser);
router.post('/join-collab', authenticateToken, joinCollab);
router.post('/:collab_id/leave',authenticateToken,leaveCollab)
export default router;  