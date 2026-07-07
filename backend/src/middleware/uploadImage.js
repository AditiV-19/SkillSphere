import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        // Detect if it's a PDF
        const isPdf = file.mimetype === 'application/pdf';
        
        return {
            folder: "profile-images",
            // Use 'raw' for PDFs, 'image' for images
            resource_type: isPdf ? "raw" : "image", 
            format: isPdf ? "pdf" : undefined,
        };
    },
});

export const upload = multer({ storage });