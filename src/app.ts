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


// load envs
dotenv.config()
const app: Application = express();

// Allowed origin for CORS
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN as string;
if (!ALLOWED_ORIGIN) {
  console.error('Allowed origin is not defined in .env file');
  process.exit(1);
}

// Configure CORS with security considerations
const corsOptions = {
  origin: ALLOWED_ORIGIN, 
  methods: 'GET,HEAD,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// CORS middleware to allow requests from any origin
app.use(cors(corsOptions));
app.use(helmet())

// Adding middlewares
app.use(bodyParser.json()); // to parse json data
app.use(bodyParser.urlencoded({ extended: true })); // to parse form data



// Create uploads directory if it doesn't exist for storage
if (!fs.existsSync(UPLOAD_DIRECTORY)) {
    fs.mkdirSync('public');
    fs.mkdirSync(UPLOAD_DIRECTORY);
}
 
// Serve static assets
app.use("/assets", express.static(UPLOAD_DIRECTORY,{
  setHeaders: (res, path) => {
 if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg')) { 
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); 
    }
  }
}));


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