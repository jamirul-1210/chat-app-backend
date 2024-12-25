import z from "zod";

export const signupSchema = z
    .object({
        name: z
            .string()
            .min(3, "Full name must be at least 3 characters")
            .max(25, "Name is too long")
            .regex(
                /^[A-Za-z]+( [A-Za-z]+)*$/,
                "Name can only contain letters and a single space between words"
            ),
        email: z.string().email("Invalid email address"),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters")
            .regex(
                /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/,
                "Password must contain at least one special character and one number"
            ),
        confirmPassword: z
            .string()
            .min(6, "Confirm password must be at least 6 characters"),
        gender: z.enum(["male", "female", "other"]),
        agreeToTerms: z
            .boolean()
            .refine((value) => value, "You must agree to the terms and conditions"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords must match",
    });

export type SignupFormData = z.infer<typeof signupSchema>;