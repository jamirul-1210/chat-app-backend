import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthenticatedRequest } from "../interfaces/AuthenticatedRequest";
import { updateAvatar } from "../services/user.service";

export const uploadProfileController = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
        const useId = req.user?._id as string;
        if (!req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "No file uploaded" });
        }
        // update to database 
        const updatedUser = await updateAvatar(useId, req.file.filename);
        res.status(StatusCodes.OK).json({
            message: "File uploaded successfully",
            file: req.file.filename,
        });
    } catch (error: any) {
        next(error);
    }
}