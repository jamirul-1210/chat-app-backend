import { Response, NextFunction } from "express";
import { getUserById, updateLastSeen } from "../services/user.service";
import { AuthenticatedRequest } from "../interfaces/AuthenticatedRequest";
import { decodeToken } from "../utils/jwtHelper";
import { StatusCodes } from "http-status-codes";

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "No token provided or invalid format" });
    }
    const token = authHeader.split(" ")[1];
    // Verify the token
    const decodedToken = decodeToken(token);
    if (!decodedToken) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid token" });
    }
    const userId = decodedToken.id;

    // fetch user by ID
    const user = await getUserById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
    }


    // attach user to req body
    req.user = user; 

    next();
  } catch (error: any) {
    next(error);
  }
};
