import { Router } from "express";
import { loginUser, logoutUser, registerUser,joinCollab } from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();
router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/logout', authenticateToken,logoutUser);
router.post('/join-collab', authenticateToken, joinCollab);
export default router;  