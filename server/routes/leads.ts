import { Router } from 'express';
import axios from 'axios';
import { exec } from 'child_process';

const router = Router();

// Send lead to CRM using curl
const sendToCRM = async (fullName: string, phone: string) => {
  const CRM_API_URL = process.env.CRM_API_URL;
  const CRM_API_KEY = process.env.CRM_API_KEY;

  if (!CRM_API_URL || !CRM_API_KEY) {
    console.log('CRM sozlanmagan');
    return false;
  }

  const cleanPhone = phone.replace(/\s/g, '');
  
  // JSON ni to'g'ri escape qilish
  const escapedName = fullName.replace(/"/g, '\\"');
  const escapedPhone = cleanPhone.replace(/"/g, '\\"');
  
  const curlCommand = `curl -X POST "${CRM_API_URL}" -H "Content-Type: application/json" -H "X-API-Key: ${CRM_API_KEY}" -d "{\\"name\\":\\"${escapedName}\\",\\"phone\\":\\"${escapedPhone}\\",\\"notes\\":\\"Landing page orqali\\"}" --max-time 10`;

  return new Promise((resolve) => {
    exec(curlCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('CRM curl xatosi:', error.message);
        resolve(false);
      } else {
        console.log('CRM ga yuborildi (curl):', stdout);
        resolve(true);
      }
    });
  });
};

// Send lead to Telegram and CRM
router.post('/', async (req, res) => {
  try {
    const { fullName, phone } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({ error: "Ism va telefon raqam kiritilishi shart" });
    }

    // CRM ga yuborish
    sendToCRM(fullName, phone);

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const adminId = process.env.TELEGRAM_ADMIN_ID;

    if (!botToken || !adminId) {
      console.error('Telegram bot token yoki admin ID topilmadi');
      return res.json({ success: true, message: "Ma'lumot qabul qilindi" });
    }

    const message = `🆕 Yangi foydalanuvchi!\n\n👤 Ism: ${fullName}\n📱 Telefon: ${phone}\n\n📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;

    try {
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: adminId,
        text: message
      });
      console.log('Telegram ga yuborildi:', fullName, phone);
    } catch (telegramError: any) {
      console.error('Telegram xatosi:', telegramError.response?.data || telegramError.message);
    }

    res.json({ success: true, message: "Ma'lumot yuborildi" });
  } catch (error) {
    console.error('Lead yuborishda xatolik:', error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

export default router;
