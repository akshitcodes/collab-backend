import { Router } from "express";
import { loginUser, logoutUser, registerUser,joinCollab, leaveCollab, generateAccessAndRefreshTokens, getUserDetails } from "../controllers/userController.js";
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
    failureRedirect: 'https://collablearn.in/login'
  }),
 async (req, res) => {
    // At this point, `req.user` should be available
    console.log('Google authentication successful:', req.user);
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(req.user);
    res.cookie('accessToken',accessToken,{httpOnly:true,secure:true,maxAge:1000*60*60*24*30});
    res.cookie('refreshToken',refreshToken,{httpOnly:true,secure:true,maxAge:1000*60*60*24*30});
    res.redirect(`https://collablearn.in/login/google?accessToken=${accessToken}`);
  }
);

router.get('/user-details',authenticateToken,getUserDetails);
export default router;  