import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import router from './routes';
import { errorHandler } from './middlewares/errorHandler';
import dotenv from "dotenv";
import { StatusCodes } from 'http-status-codes';
import fs from 'fs';
import { UPLOAD_DIRECTORY } from './config/constants';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// load envs
dotenv.config()
const app: Application = express();

// Allowed origin for CORS
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN as string;
if (!ALLOWED_ORIGIN) {
  console.error('Allowed origin is not defined in .env file');
  process.exit(1);
}

// CORS middleware to allow requests from any origin
app.use(cors({
  origin: [ALLOWED_ORIGIN],
  credentials: true
}));


// Adding middlewares
app.use(bodyParser.json()); // to parse json data
app.use(bodyParser.urlencoded({ extended: true })); // to parse form data
app.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});

// Apply rate limiting to all routes
app.use(limiter);


// Create uploads directory if it doesn't exist for storage
if (!fs.existsSync(UPLOAD_DIRECTORY)) {
    fs.mkdirSync('public');
    fs.mkdirSync(UPLOAD_DIRECTORY);
}
 
// Serve static assets
app.use("/assets", express.static(UPLOAD_DIRECTORY));


// test route to check if the server is running
app.get('/', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'Backend is Running!' });
});



// API routes
app.use("/api", router);

// 404 route
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.status(StatusCodes.NOT_FOUND).json({ message: "Route not found" });
});

// Error handler
app.use(errorHandler)

export default app;