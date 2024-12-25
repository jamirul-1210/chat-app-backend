import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";


const nodeEnvironment = process.env.NODE_ENV as string;
if (!nodeEnvironment) {
  console.error('NODE_ENV is not defined in .env file');
  process.exit(1);
}


export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  if (nodeEnvironment === 'development') {
    console.error(err);
  }

  // Handle unknown errors (500 Internal Server Error)
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error", details: (nodeEnvironment !== 'production') ? err.message : '' });
};

