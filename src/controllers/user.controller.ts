import { NextFunction, Request, Response } from "express";
import { createUser, getUserById, findUserByEmailWithPass } from "../services/user.service";
import { z } from "zod";
import { generateToken } from "../utils/jwtHelper";
import { hashPassword, verifyPassword } from "../utils/bcryptHelper";
import { formatZodErrors } from "../utils/zodHelper";
import { AuthenticatedRequest } from "../interfaces/AuthenticatedRequest";
import { StatusCodes } from "http-status-codes";
import { signupSchema } from "../schemas/signupSchema";
import { generateUsername } from "../utils/genrate.username";


// controller function to create a new user
export const createUserController = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    // validate request body
    const { email, password, name, agreeToTerms, gender, } = signupSchema.parse(req.body);

    // check if user already exists
    const existingUser = await findUserByEmailWithPass(email);
    if (existingUser) {
      return res.status(StatusCodes.CONFLICT).json({ message: "User with this email alreadclsy exists" });
    }

    // create a username using full name
    const genaratedUsername = generateUsername(name);

    // hash the password
    const hashedPassword = await hashPassword(password);

    // create the user with hashed password
    const user = await createUser({ name, email, password: hashedPassword, username: genaratedUsername, gender, agreeToTerms });

    // check if user successfully created
    if (!user) return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong while creating user." });

    // send success response to user
    res.status(StatusCodes.CREATED).json({
      message: "User created successfully",
    });

  } catch (error: any) {
    // handle it if it is a zod validation error
    if (error instanceof z.ZodError) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Validation error", errors: formatZodErrors(error) });
    } else {
      next(error)
    }
  }
};


// ----------------------------------------------------------- 

/**
 * Get a user by ID.
 */
export const getUserByIdController = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user?._id as string;
    const user = await getUserById(userId);

    if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });

    res.status(StatusCodes.OK).json(user);

  } catch (error: any) {
    next(error);
  }
};

// ----------------------------------------------------------
/**
 * Login a user
 */
// Zod schema for request body validation
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const loginController = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Validate request body
    const { email, password } = loginSchema.parse(req.body);

    // Fetch the user by email
    const user = await findUserByEmailWithPass(email);
    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateToken({ id: user._id });

    // Send response to client
    const payload = {
      imagrUrl:user.avatar,
      userName: user.username,
      name: user.name,
      email: user.email,
      id: user._id
    }
    res.status(StatusCodes.OK).json({
      message: "Login successful",
      user: payload,
      token
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Validation error", errors: formatZodErrors(error) });
    }
    next(error)
  }
};

// ----------------------------------------------------------


/**
 * Delete User
 */

