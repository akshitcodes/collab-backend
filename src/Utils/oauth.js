
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { pool } from '../DB/db.js';

console.log("Registering Google OAuth strategy");
const handleGoogleLogin=async (accessToken, refreshToken, profile, done) => {
  // Save user to DB, etc.
  try{
    const user=await pool.query('SELECT * FROM users WHERE email = $1', [profile.emails[0].value]);
    console.log('Google profile:', profile);
  if(user.rows.length===0){
    const newUser=pool.query('INSERT INTO users (email) VALUES ($1) RETURNING *', [profile.emails[0].value]);
    return done(null, newUser);
  }
  }catch(error){
    return done(error);
  }
  return done(null, profile);
  
}
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/users/auth/google/callback'
},handleGoogleLogin));
