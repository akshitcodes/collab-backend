import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import homeRoutes from './src/routes/homeRoutes.js';
import collabRoutes from './src/routes/collabRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import morgan from 'morgan';
// Load environment variables
dotenv.config();
import cookieParser from 'cookie-parser';


const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Security HTTP headers
app.use(helmet());



// Enable CORS with default or custom options
app.use(cors(
    {    // Change this to your frontend URL
        origin: process.env.CORS_ORIGIN || '*', // Allow 
        credentials: true, // Allow cookies to be sent with requests
    }
));

 app.use((req, res, next) => {
  const oldSend = res.send;
  res.send = function (body) {
    res.locals.body = body; // Capture response body
    return oldSend.call(this, body);
  };
  next();
});
morgan.token('req-headers', (req) => JSON.stringify(req.headers));
morgan.token('req-body', (req) => JSON.stringify(req.body));
morgan.token('res-headers', (req, res) => JSON.stringify(res.getHeaders()));
morgan.token('res-body', (req, res) => {
  const body = res.locals.body;
  // Optional: truncate if large
  return typeof body === 'object' ? JSON.stringify(body) : String(body);
});


app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms | ' +
      'Request Headers: :req-headers  Request Body: :req-body\n Response Body: :res-body\n'
  )
);
 // 'Response Headers: :res-headers\n' +
// Parse incoming JSON requests


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
