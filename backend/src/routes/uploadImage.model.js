import { Router } from 'express';

import {upload} from '../middleware/uploadImage.js';


const router = Router();

router.post("/", upload.single("image"), async (req, res) => {
    try {
        console.log("req.file =", req.file);
        res.json({
            imageUrl: req.file.path,
            publicId: req.file.filename,
        });
    } catch (error) {
        console.error("Upload Error (route):", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Catches errors thrown by multer/CloudinaryStorage before the route handler runs
router.use((err, req, res, next) => {
    console.log("=== Multer/Cloudinary Error ===");
    console.dir(err, { depth: null });
    res.status(500).json({
        message: "Upload failed",
        error: err?.message || String(err),
        http_code: err?.http_code,
    });
});


export default router;