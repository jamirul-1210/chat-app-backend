import jwt, { JwtPayload } from "jsonwebtoken";

// Generate JWT Token
export const generateToken = (payload: object, expiresIn?: string): string => {
  const secretKey = process.env.JWT_ACCES_TOKEN_SECRET_KEY as string;
  if (!secretKey) throw new Error("JWT secret key is not defined");

  return jwt.sign(payload, secretKey);
};

// Decode and Verify JWT Token
export const decodeToken = (token: string): JwtPayload | null => {
  const secretKey = process.env.JWT_ACCES_TOKEN_SECRET_KEY as string;
  if (!secretKey) throw new Error("JWT secret key is not defined");

  try {
    return jwt.verify(token, secretKey) as JwtPayload; 
  } catch (error:any) {
    console.error("Invalid or expired token", error.message);
    return null;
  }
};
 