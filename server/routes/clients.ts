import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

// Lead/Client Schema
const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['new', 'contacted', 'converted', 'rejected'], default: 'new' },
  source: { type: String, default: 'api' },
  createdAt: { type: Date, default: Date.now }
});

const Client = mongoose.models.Client || mongoose.model('Client', clientSchema);

// API Key middleware
const validateApiKey = (req: any, res: any, next: any) => {
  const apiKey = req.headers['x-api-key'];
  const validKey = process.env.EXTERNAL_API_KEY;

  if (!apiKey || apiKey !== validKey) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid or missing API key' 
    });
  }
  next();
};

// POST /api/clients - Yangi mijoz qo'shish
router.post('/', validateApiKey, async (req, res) => {
  try {
    const { name, phone, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ 
        success: false, 
        error: 'name va phone majburiy' 
      });
    }

    // Phone formatini tekshirish
    const cleanPhone = phone.replace(/\s/g, '');
    if (!/^\+998\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ 
        success: false, 
        error: "Telefon raqam formati noto'g'ri. Format: +998XXXXXXXXX" 
      });
    }

    const client = await Client.create({
      name,
      phone: cleanPhone,
      notes: notes || '',
      status: 'new',
      source: 'api'
    });

    res.status(201).json({
      success: true,
      client: {
        id: client._id,
        name: client.name,
        phone: client.phone,
        status: client.status
      }
    });
  } catch (error) {
    console.error('Client yaratishda xatolik:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server xatosi' 
    });
  }
});

// GET /api/clients - Barcha mijozlarni olish (optional)
router.get('/', validateApiKey, async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      clients: clients.map(c => ({
        id: c._id,
        name: c.name,
        phone: c.phone,
        notes: c.notes,
        status: c.status,
        source: c.source,
        createdAt: c.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
});

export default router;
