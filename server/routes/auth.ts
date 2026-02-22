import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../db';
import { JWT_SECRET, authenticateToken, AuthRequest } from '../middleware/auth';
import { exec } from 'child_process';

const router = Router();

// CRM ga "connected" statusi bilan yuborish
const sendToCRMConnected = async (fullName: string, phone: string) => {
  const CRM_API_URL = process.env.CRM_API_URL;
  const CRM_API_KEY = process.env.CRM_API_KEY;

  if (!CRM_API_URL || !CRM_API_KEY) {
    console.log('CRM sozlanmagan');
    return false;
  }

  const cleanPhone = phone.replace(/\s/g, '');
  const escapedName = fullName.replace(/"/g, '\\"');
  const escapedPhone = cleanPhone.replace(/"/g, '\\"');
  
  const curlCommand = `curl -X POST "${CRM_API_URL}" -H "Content-Type: application/json" -H "X-API-Key: ${CRM_API_KEY}" -d "{\\"name\\":\\"${escapedName}\\",\\"phone\\":\\"${escapedPhone}\\",\\"status\\":\\"connected\\",\\"notes\\":\\"Saytga ulandi - ro'yxatdan o'tdi\\"}" --max-time 10`;

  return new Promise((resolve) => {
    exec(curlCommand, (error, stdout) => {
      if (error) {
        console.error('CRM curl xatosi:', error.message);
        resolve(false);
      } else {
        console.log('CRM ga connected yuborildi:', stdout);
        resolve(true);
      }
    });
  });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { fullName, phone, password } = req.body;

    if (!fullName || !phone || !password) {
      return res.status(400).json({ error: "Barcha maydonlarni to'ldiring" });
    }

    // Bo'shliqlarni olib tashlash
    const cleanPhone = phone.replace(/\s/g, '');
    
    const existingUser = await User.findOne({ phone: cleanPhone });
    if (existingUser) {
      return res.status(400).json({ error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // 7 kunlik bepul sinov muddati
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    
    const user = await User.create({
      fullName,
      phone: cleanPhone,
      password: hashedPassword,
      subscriptionEnd: trialEndDate,
      usedFreeTrial: true
    });

    // CRM ga "connected" statusi bilan yuborish
    sendToCRMConnected(fullName, cleanPhone);

    const token = jwt.sign(
      { id: user._id, phone, role: 'user' },
      JWT_SECRET
      // muddatsiz token - chiqib ketmaydi
    );

    res.json({
      token,
      user: { id: user._id, fullName, phone, role: 'user' }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: "Telefon va parolni kiriting" });
    }

    // Bo'shliqlarni olib tashlash
    const cleanPhone = phone.replace(/\s/g, '');
    const user = await User.findOne({ phone: cleanPhone });
    if (!user) {
      return res.status(400).json({ error: 'Foydalanuvchi topilmadi' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Parol noto'g'ri" });
    }

    const token = jwt.sign(
      { id: user._id, phone: user.phone, role: user.role },
      JWT_SECRET
      // muddatsiz token - chiqib ketmaydi
    );

    res.json({
      token,
      user: { id: user._id, fullName: user.fullName, phone: user.phone, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }
    res.json({ id: user._id, fullName: user.fullName, phone: user.phone, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

export default router;
