
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

console.log("Registering Google OAuth strategy");

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/users/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  // Save user to DB, etc.
  return done(null, profile);
}));
