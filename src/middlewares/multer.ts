import multer from "multer";
import path from "path";
import { UPLOAD_DIRECTORY } from "../config/constants";




// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIRECTORY); // Specify the directory to save uploaded files
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

export const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});
