import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import homeRoutes from './src/routes/homeRoutes.js';
import collabRoutes from './src/routes/collabRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
// Load environment variables
dotenv.config();
import cookieParser from 'cookie-parser';


const app = express();
app.use(cookieParser());

// Security HTTP headers
app.use(helmet());

// Enable CORS with default or custom options
app.use(cors(
    {   origin:'http://localhost:3000', // Change this to your frontend URL
        // origin: process.env.CORS_ORIGIN || '*', // Allow 
        credentials: true, // Allow cookies to be sent with requests
    }
));

// Parse incoming JSON requests
app.use(express.json({ limit: '1mb' }));

// Prevent HTTP Parameter Pollution
// (optional, install hpp if needed)
// import hpp from 'hpp';
// app.use(hpp());

// Rate limiting (optional, install express-rate-limit if needed)
// import rateLimit from 'express-rate-limit';
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// Routes
app.use('/', homeRoutes);
app.use('/collabs', collabRoutes);
app.use('/users', userRoutes);
export default app;
