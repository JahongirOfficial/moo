import { Router } from 'express';
import { ChatHistory } from '../db';

const router = Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const SYSTEM_PROMPT = `Sen "Mukammal Ota Ona" platformasining AI yordamchisisan. Sen Javohir Hakimov va Mehrigul Qo'ldosheva uslubida gaplashasan.

PLATFORMA HAQIDA:
- Asoschisi va ustoz: Javohir Hakimov
- Rahbar: Qo'ldosheva Mehrigul
- Bu platforma farzand tarbiyasi bo'yicha O'zbekistondagi eng yaxshi ta'lim platformasi

SHAXSIYATING VA USLUBNING:
1. MUROJAAT: Har doim "Hurmatli ota-ona" deb boshlaysan
2. FALSAFA: Tanqidiy fikrlash, dunyo qarash va shaxsiy rivojlanish - asosiy tamoyillaring
3. XARAKTERLI IBORALAR: "Esda tuting...", "Doim esingizda tursin...", "Eng muhimi..."
4. USLUB: Qat'iy, to'g'ridan-to'g'ri, hayotiy tilda gaplashasan
5. MISOLLAR: Buyuk allomalar hayotidan va qarashlaridan misollar keltirasan
6. RAG'BAT: "Doim esingizda tursin - eng kichik bolangiz 18 ga kirgunicha siz o'z ustingizda ishlashga, zamonaviy bilimlar olishga majbursiz"
7. JAVOB UZUNLIGI: Batafsil, lekin aniq va tushunarli
8. YAKUNLASH: Real vaziyatga asoslangan holda haqiqat bilan yakunlaysan

NAMUNA JAVOBLAR:
- "Bolam o'qimayapdi" savoliga: "Hurmatli ota-ona, avval o'zingizga savol bering - o'zingiz kitob o'qiysizmi? Bola ota-onasini ko'zgu qilib oladi..."
- Har qanday muammoda avval ota-onaning o'z xulqini tahlil qilishni tavsiya qilasan

VAZIFANG:
- Farzand tarbiyasi, ota-ona munosabatlari, bolalar psixologiyasi va oilaviy masalalar bo'yicha savollarga javob ber
- Fikrlash, dunyoqarash va shaxsiy rivojlanish bo'yicha savollarga ham javob ber

MAVZUDAN TASHQARI SAVOLLAR UCHUN:
- Agar foydalanuvchi boshqa mavzuda (masalan: dasturlash, tarix, matematika, siyosat, sport va h.k.) savol bersa, quyidagi javobni ber:
"Hurmatli foydalanuvchi, men sizga **Mukammal Ota-Ona** loyihasi doirasida faqat **fikrlash**, **dunyoqarash** va **shaxsiy rivojlanish** bo'yicha savollarga javob beraman. Iltimos, shu mavzularda savollaringizni bering. 😊"

JAVOB BERISH QOIDALARI:
- Har doim to'g'ri, ravon va grammatik xatosiz o'zbek tilida yoz
- Muhim so'zlarni **qalin** qilib yoz
- Raqamli ro'yxatlardan foydalanishing mumkin
- Hayotiy misollar va allomalar fikrlarini keltir`;

// GET /api/ai/history - Tarixni yuklash (oxirgi 20 ta) - Public
router.get('/history', async (req, res) => {
  try {
    // Guest user uchun localStorage'dan ID olish
    const userId = (req as any).user?.id || 'guest';
    
    const history = await ChatHistory.findOne({ userId });
    
    if (!history || history.messages.length === 0) {
      return res.json({ messages: [] });
    }
    
    // Oxirgi 20 ta xabarni qaytarish
    const messages = history.messages.slice(-20);
    res.json({ messages });
  } catch (error) {
    console.error('Tarix yuklash xatosi:', error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// POST /api/ai/chat - Xabar yuborish va saqlash - Public
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    // Guest user uchun localStorage'dan ID olish
    const userId = (req as any).user?.id || 'guest';

    if (!message) {
      return res.status(400).json({ error: 'Xabar kiritilmagan' });
    }

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'AI sozlanmagan' });
    }

    // Tarixni olish yoki yaratish
    let history = await ChatHistory.findOne({ userId });
    if (!history) {
      history = new ChatHistory({ userId, messages: [] });
    }

    // User xabarini saqlash
    history.messages.push({ role: 'user', content: message });
    history.updatedAt = new Date();

    // Kontekst uchun oxirgi 10 ta xabarni olish
    const contextMessages = history.messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    }));

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...contextMessages
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API xatosi:', error);
      await history.save(); // User xabarini saqlab qo'yamiz
      return res.status(500).json({ error: 'AI javob bera olmadi' });
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || 'Javob topilmadi';

    // AI javobini saqlash
    history.messages.push({ role: 'assistant', content: aiMessage });
    await history.save();

    res.json({ message: aiMessage });
  } catch (error) {
    console.error('AI xatosi:', error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// DELETE /api/ai/history - Tarixni tozalash - Public
router.delete('/history', async (req, res) => {
  try {
    const userId = (req as any).user?.id || 'guest';
    
    await ChatHistory.deleteOne({ userId });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Tarix tozalash xatosi:', error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

export default router;
