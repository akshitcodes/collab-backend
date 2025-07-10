import { pool, query } from "../DB/db.js";
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from "../Utils/generateJWT.js";

export const registerUser = async (req, res) => {
    console.log('Registering user:', req.body);
    const { username, email, password } = req.body;
    // Make email lowercase
    const lowercaseEmail = email ? email.toLowerCase() : null;
    const lowercaseUsername = username ? username.toLowerCase() : null;
    if (!lowercaseUsername || !lowercaseEmail || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = $1 OR username = $2',
        [lowercaseEmail, lowercaseUsername]
    );
    if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
    }
    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
            [lowercaseUsername, lowercaseEmail, hashedPassword]
        );
        
         const newUser = result.rows[0];
         const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(newUser);
        console.log('User registered successfully:', result.rows[0]);
        return res.status(201).json({ user: newUser,accessToken, refreshToken });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ error: `Internal server error ${error}` });
    }
}

export const generateAccessAndRefreshTokens = async (user) => {
    // Generate access and refresh tokens using imported functions
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    return { accessToken, refreshToken };
}

export const loginUser = async (req, res) => {
    console.log('Logging in user:', req.body);
    //make email lowercase

    const { email, password } = req.body;
    const isEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
   const lowercaseEmail = email ? email.toLowerCase() : null;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email or password are required' });
    }

    try {
         const query = isEmail
      ? 'SELECT * FROM users WHERE email = $1'
      : 'SELECT * FROM users WHERE username = $1';
        const result = await pool.query(
            query,
            [lowercaseEmail]
        );
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user);
        console.log('Generated tokens:', { accessToken, refreshToken });
        if (!accessToken || !refreshToken) {
            return res.status(500).json({ error: 'Failed to generate tokens' });
        }
        const options = {
            // httpOnly: true,
            secure: true, // Use secure cookies in production
            sameSite: "None",
        };

        return res.status(200).cookie('accessToken', accessToken, options
        ).cookie('refreshToken', refreshToken, options).json({ message: 'Login successful', user ,accessToken, refreshToken });
    } catch (error) {
        console.error('Error logging in user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const logoutUser = (req, res) => {
    console.log('Logging out user');
    // Clear cookies
    res.clearCookie('accessToken', { sameSite: "None", secure: true });
    res.clearCookie('refreshToken', { sameSite: "None", secure: true });
    return res.status(200).json({ message: 'Logout successful' });
}

export const joinCollab = async (req, res) => {
    const userId = req.user.id; // Assuming user ID is stored in req.user
    const collabId = req.body?.collabId; // Assuming collab ID is passed as a URL parameter

    console.log(`User ${userId} joining collab `,req.body?.collabId);
    if (!collabId) {
        return res.status(400).json({ error: 'Collab ID is required' });
    }
    try {
        // Check if the user is already a member of the collab
        const existingMember = await pool.query(
            'SELECT * FROM collab_memberships WHERE user_id = $1 AND collab_id = $2',
            [userId, collabId]
        );

        if (existingMember.rows.length > 0) {
            return res.status(400).json({ error: 'User is already a member of this collab' });
        }

        // Insert the user into the collab_members table
        await pool.query(
            'INSERT INTO collab_memberships (user_id, collab_id,role) VALUES ($1, $2, $3)',
            [userId, collabId, 'member']
        );

        return res.status(200).json({ message: 'Successfully joined the collab' });
    } catch (error) {
        console.error('Error joining collab:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

