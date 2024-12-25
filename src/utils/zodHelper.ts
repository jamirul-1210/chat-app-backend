import { ZodError } from "zod";

export const formatZodErrors = (error: ZodError): string[] => {
  return error.errors.map((err) => {
    return `${err.path.join(".")}: ${err.message}`;
  });
};