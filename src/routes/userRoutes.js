import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();
router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/logout', authenticateToken,logoutUser);
export default router;  