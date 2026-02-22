import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { connectDB, Section, Category } from './db';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import lessonRoutes from './routes/lessons';
import userRoutes from './routes/users';
import uploadRoutes from './routes/upload';
import sectionRoutes from './routes/sections';
import leadRoutes from './routes/leads';
import aiRoutes from './routes/ai';
import clientRoutes from './routes/clients';
import { authenticateToken, checkSubscription } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes); // Public - no auth required
app.use('/api/clients', clientRoutes); // External API with X-API-Key

// Public sections endpoint (for landing page)
app.get('/api/sections/public', async (req, res) => {
  try {
    const sections = await Section.find().sort({ orderIndex: 1 });
    const sectionsWithCount = await Promise.all(
      sections.map(async (section) => {
        const categoryCount = await Category.countDocuments({ sectionId: section._id });
        return {
          id: section._id,
          name: section.name,
          icon: section.icon,
          color: section.color,
          categoryCount
        };
      })
    );
    res.json(sectionsWithCount);
  } catch (error) {
    res.status(500).json({ error: "Bo'limlarni olishda xatolik" });
  }
});

// PUBLIC API - Barcha foydalanuvchilar va to'lov ma'lumotlari (auth talab qilinmaydi)
import { User } from './db';
app.get('/api/public/payments', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('fullName phone subscriptionEnd createdAt')
      .sort({ subscriptionEnd: 1 });
    
    const now = new Date();
    
    const usersWithPayment = users.map(user => {
      const subscriptionEnd = user.subscriptionEnd ? new Date(user.subscriptionEnd) : null;
      const isActive = subscriptionEnd && subscriptionEnd > now;
      const daysLeft = isActive 
        ? Math.ceil((subscriptionEnd!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) 
        : 0;
      
      return {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        subscriptionEnd: subscriptionEnd ? subscriptionEnd.toISOString().split('T')[0] : null,
        daysLeft: daysLeft,
        isActive: isActive,
        status: !subscriptionEnd ? 'no_subscription' : (isActive ? 'active' : 'expired'),
        createdAt: user.createdAt
      };
    });

    res.json({
      total: usersWithPayment.length,
      activeCount: usersWithPayment.filter(u => u.isActive).length,
      expiredCount: usersWithPayment.filter(u => u.status === 'expired').length,
      users: usersWithPayment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Alternativ endpoint (nginx bypass uchun)
app.get('/payments', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('fullName phone subscriptionEnd createdAt')
      .sort({ subscriptionEnd: 1 });
    
    const now = new Date();
    
    const usersWithPayment = users.map(user => {
      const subscriptionEnd = user.subscriptionEnd ? new Date(user.subscriptionEnd) : null;
      const isActive = subscriptionEnd && subscriptionEnd > now;
      const daysLeft = isActive 
        ? Math.ceil((subscriptionEnd!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) 
        : 0;
      
      return {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        subscriptionEnd: subscriptionEnd ? subscriptionEnd.toISOString().split('T')[0] : null,
        daysLeft: daysLeft,
        isActive: isActive,
        status: !subscriptionEnd ? 'no_subscription' : (isActive ? 'active' : 'expired'),
        createdAt: user.createdAt
      };
    });

    res.json({
      total: usersWithPayment.length,
      activeCount: usersWithPayment.filter(u => u.isActive).length,
      expiredCount: usersWithPayment.filter(u => u.status === 'expired').length,
      users: usersWithPayment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

app.use('/api/ai', aiRoutes); // Public - no auth required
app.use('/api/sections', sectionRoutes); // Public - no auth required
app.use('/api/categories', categoryRoutes); // Public - no auth required
app.use('/api/lessons', lessonRoutes); // Public - no auth required
app.use('/api/users', authenticateToken, userRoutes); // Admin only
app.use('/api/upload', authenticateToken, uploadRoutes); // Admin only

// Public video streaming with Range Request support
app.use('/api/videos', (req, res) => {
  const videoPath = path.join(__dirname, '../uploads', req.path);
  
  // Fayl mavjudligini tekshirish
  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: 'Video topilmadi' });
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  // Video MIME type
  const ext = path.extname(videoPath).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogg': 'video/ogg',
    '.mov': 'video/quicktime'
  };
  const contentType = mimeTypes[ext] || 'video/mp4';

  if (range) {
    // Range Request - partial content
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const file = fs.createReadStream(videoPath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600'
    });

    file.pipe(res);
  } else {
    // No range - full file
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600'
    });

    fs.createReadStream(videoPath).pipe(res);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ishga tushdi: http://localhost:${PORT}`);
  console.log(`Network: http://0.0.0.0:${PORT}`);
});
