import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// 1. Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Storage Configuration (Sab kuch allow karne ke liye)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog_builder_media', // Cloudinary folder name
    resource_type: 'auto',        // 🔥 Sabse zaroori: Isse image, video, pdf sab allow hoga
    // Note: 'allowed_formats' ko hata diya hai taaki koi restriction na rahe
  },
});

// 3. Multer Middleware
export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit (Video uploads ke liye zaroori hai)
  }
});

export default cloudinary;