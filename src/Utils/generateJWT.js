import jwt  from "jsonwebtoken";


export const generateAccessToken = (user) => {
  return jwt.sign({
        id:user.id,
        email:user.email,
        username:user.username,
    },
   process.env.ACCESS_TOKEN_SECRET,
  // "V6SmmzO2h9jDmup5ncOcYXC6E",
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY,
        // "1d"
    })
}
export const generateRefreshToken = (user) => {
  return jwt.sign({
        email:user.email,
        username:user.username,
    },
   process.env.REFRESH_TOKEN_SECRET,
 
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY,
        // "7d"
    })
}
