import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import supabase from '../config/supabase';

// Use memory storage instead of disk storage since we're uploading to Supabase
const storage = multer.memoryStorage();

// File filter to ensure only images are uploaded
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // allows only image 
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image file.') as any, false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

export interface SupabaseFile extends Express.Multer.File {
    supabaseUrl?: string;
}

export interface UploadRequest extends Request {
    file?: SupabaseFile;
}

// Middleware to handle Supabase upload after multer has placed file in memory
export const uploadToSupabase = async (req: UploadRequest, res: Response, next: NextFunction) => {
    if (!req.file) {
        return next();
    }

    try {
        const file = req.file;
        const fileExt = path.extname(file.originalname);
        const fileName = `image-${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;

        console.log(`Uploading file to Supabase: ${fileName} (${file.size} bytes)`);

        // Upload to Supabase Storage 'car-images' bucket
        const { data, error } = await supabase.storage
            .from('car-images')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) {
            console.error("Supabase upload error:", error);
            throw error;
        }

        console.log(`Upload successful! Path: ${data.path}`);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('car-images')
            .getPublicUrl(fileName);

        // Attach the Supabase URL to the request so the controller can save it to the database
        req.file.supabaseUrl = publicUrl;

        next();
    } catch (error: any) {
        console.error("Supabase upload error (Full):", error);
        res.status(500).json({
            error: 'Failed to upload image to cloud storage',
            message: error.message,
            details: error
        });
    }
};
