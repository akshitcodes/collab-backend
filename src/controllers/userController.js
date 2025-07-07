import { pool, query } from "../DB/db.js";
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from "../Utils/generateJWT.js";

export const registerUser = async (req, res) => {
    console.log('Registering user:', req.body);
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = $1 OR username = $2',
        [email, username]
    );
    if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
    }
    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
            [username, email, hashedPassword]
        );
        const newUser = result.rows[0];
         const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user);
        return res.status(201).json({ user: newUser,accessToken, refreshToken });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ error: 'Internal server error' });
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
    const { email, password } = req.body;

    if (!email && !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
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

