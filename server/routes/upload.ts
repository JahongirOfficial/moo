import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { isAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate secure random filename
    const randomName = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${randomName}${ext}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only video files
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Faqat video fayllar (MP4, WebM, OGG) yuklash mumkin'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
  }
});

// Upload video (admin only)
router.post('/video', isAdmin, upload.single('video'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Video fayl yuklanmadi' });
    }

    // Return secure video URL (will be served through authenticated endpoint)
    const videoUrl = `/api/videos/${req.file.filename}`;

    res.json({
      message: 'Video muvaffaqiyatli yuklandi',
      videoUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Video yuklashda xatolik' });
  }
});

// Delete video (admin only)
router.delete('/video/:filename', isAdmin, async (req: AuthRequest, res) => {
  try {
    const filePath = path.join(uploadsDir, req.params.filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: "Video o'chirildi" });
    } else {
      res.status(404).json({ error: 'Video topilmadi' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Video o'chirishda xatolik" });
  }
});

export default router;
