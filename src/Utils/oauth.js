
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { pool } from '../DB/db.js';

console.log("Registering Google OAuth strategy");
const handleGoogleLogin=async (accessToken, refreshToken, profile, done) => {
  // Save user to DB, etc.
  try{
    const user=await pool.query('SELECT * FROM users WHERE email = $1', [profile.emails[0].value]);
    console.log("User found:", user.rows[0]);
    console.log('Google profile:', profile);
   
  if(user.rows.length===0){
    const username=profile.displayName.split(' ').join('').toLowerCase();
    const uniqueUsername=await generateUniqueUsername(username);
    const newUser=await pool.query('INSERT INTO users (email,username) VALUES ($1,$2) RETURNING *', [profile.emails[0].value,uniqueUsername]);
    return done(null, newUser.rows[0]);
  }
  return done(null, user.rows[0]);
  }catch(error){
    return done(error);
  }
  
  
}
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},handleGoogleLogin));

const generateUniqueUsername = async (baseName) => {
  let username, exists;

  do {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    username = `${baseName}${suffix}`.toLowerCase();
    const result = await pool.query(
      'SELECT 1 FROM users WHERE username = $1 LIMIT 1',
      [username]
    );
    exists = result.rowCount > 0;
  } while (exists);
  console.log("Unique username generated:", username);
  return username;
};
