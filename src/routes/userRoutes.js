import { Router } from "express";
import { loginUser, logoutUser, registerUser,joinCollab, leaveCollab } from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import passport from "passport";

const router = Router();
router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/logout', authenticateToken,logoutUser);
router.post('/join-collab', authenticateToken, joinCollab);
router.post('/:collab_id/leave',authenticateToken,leaveCollab)
router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// router.get('/auth/google/callback',
//   passport.authenticate('google',{ session: false }, { failureRedirect: '/login' }),
//   (req, res) => {
//     res.redirect('https://collablearn.in/get-started');
//   }
// );
router.get('/auth/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login'
  }),
  (req, res) => {
    // At this point, `req.user` should be available
    res.redirect('https://collablearn.in/get-started');
  }
);


export default router;  