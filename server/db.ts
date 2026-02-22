import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mukammal-ota-ona';

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB ga ulandi');
    await seedData();
  } catch (error) {
    console.error('MongoDB ulanish xatosi:', error);
    process.exit(1);
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isSubscribed: { type: Boolean, default: false },
  subscriptionEnd: { type: Date, default: null },
  usedFreeTrial: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Section (Bo'lim) Schema
const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, default: 'folder' },
  color: { type: String, default: 'from-emerald-500 to-emerald-600' },
  orderIndex: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'pause'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

// Category Schema
const categorySchema = new mongoose.Schema({
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', default: null },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'category' },
  color: { type: String, default: 'green' },
  orderIndex: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'pause'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

// Lesson Schema
const lessonSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  savollar: { type: String, default: '' },
  xulosa: { type: String, default: '' },
  duration: { type: String, default: '5 daqiqa' },
  type: { type: String, enum: ['article', 'video', 'audio'], default: 'article' },
  videoUrl: { type: String, default: '' },
  orderIndex: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// ChatHistory Schema - AI suhbat tarixi
const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  updatedAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
export const Section = mongoose.model('Section', sectionSchema);
export const Category = mongoose.model('Category', categorySchema);
export const Lesson = mongoose.model('Lesson', lessonSchema);
export const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

// Seed initial data
async function seedData() {
  // Create admin if not exists
  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('20100804', 10);
    await User.create({
      fullName: 'Administrator',
      phone: '+998773109828',
      password: hashedPassword,
      role: 'admin'
    });
    console.log('Admin yaratildi: +998773109828 / 20100804');
  }

  // Seed sections if empty
  const sectionCount = await Section.countDocuments();
  if (sectionCount === 0) {
    await Section.insertMany([
      { name: 'Ota-ona shaxsiy rivojlanishi', icon: 'self_improvement', color: 'from-emerald-500 to-emerald-600', orderIndex: 0 },
      { name: '6-9 yosh muammolari', icon: 'child_care', color: 'from-teal-500 to-teal-600', orderIndex: 1 },
      { name: '10-12 yosh muammolari', icon: 'school', color: 'from-green-500 to-green-600', orderIndex: 2 },
      { name: '13-15 yosh muammolari', icon: 'psychology', color: 'from-emerald-600 to-emerald-700', orderIndex: 3 },
      { name: '16-18 yosh muammolari', icon: 'person', color: 'from-teal-600 to-teal-700', orderIndex: 4 },
    ]);
    console.log("Bo'limlar qo'shildi");
  }

  // Seed categories if empty
  const categoryCount = await Category.countDocuments();
  if (categoryCount === 0) {
    const categories = await Category.insertMany([
      { name: 'Xulq-atvor', description: 'Bolaning xulq-atvori va uni boshqarish', icon: 'psychology', color: 'green' },
      { name: "Ta'lim va Maktab", description: "O'qish, maktab muammolari", icon: 'school', color: 'green' },
      { name: 'Psixologiya', description: 'Bolalar psixologiyasi asoslari', icon: 'favorite', color: 'red' },
      { name: 'Muloqot', description: 'Bola bilan muloqot qilish', icon: 'forum', color: 'purple' },
      { name: 'Intizom', description: 'Intizomni shakllantirish', icon: 'fact_check', color: 'orange' },
      { name: 'Salomatlik', description: 'Jismoniy va ruhiy salomatlik', icon: 'fitness_center', color: 'teal' },
    ]);

    // Seed lessons
    const lessons = [
      { categoryId: categories[0]._id, title: 'Injiqlik sabablari', content: 'Bolaning injiqlik qilishining asosiy sabablari va ularni tushunish.\n\nBolalar turli sabablarga ko\'ra injiqlik qilishlari mumkin:\n\n1. Charchoq - Bola charchagan paytda injiqlik qilishi tabiiy.\n\n2. Ochlik - Ovqatlanish vaqti o\'tib ketganda bolalar bezovta bo\'lishadi.\n\n3. E\'tibor talab qilish - Ba\'zan bolalar ota-onaning e\'tiborini tortish uchun injiqlik qilishadi.\n\n4. Mustaqillik istagi - Bola o\'zi qilmoqchi bo\'lgan ishni bajara olmasa, g\'azablanishi mumkin.\n\nBu holatlarni tushunish va sabr bilan yondashish muhim.', type: 'article', orderIndex: 1 },
      { categoryId: categories[0]._id, title: 'Agressiyani boshqarish', content: 'Bolada agressiv xulq-atvorni qanday boshqarish mumkin.\n\nAgressiya bolalarda turli shakllarda namoyon bo\'lishi mumkin. Buni boshqarish uchun:\n\n1. Tinch qoling - O\'zingiz ham g\'azablanmang.\n\n2. Sababini aniqlang - Nima uchun bunday qilayotganini tushuning.\n\n3. His-tuyg\'ularni nomlang - "Sen g\'azablanganga o\'xshaysan" deb ayting.\n\n4. Muqobil yo\'l ko\'rsating - Boshqa usulda his-tuyg\'ularini ifodalashni o\'rgating.', type: 'article', orderIndex: 2 },
      { categoryId: categories[0]._id, title: "Qaysarlik bilan ishlash", content: "Qaysar bolalar bilan qanday muomala qilish kerak.\n\nQaysarlik aslida bolaning mustaqillik istagi belgisi. Buni to'g'ri yo'naltirish kerak:\n\n1. Tanlov bering - \"Qaysi ko'ylakni kiyasan?\" deb so'rang.\n\n2. Oldindan ogohlantiring - \"5 daqiqadan keyin o'yin tugaydi\".\n\n3. Izchil bo'ling - Qoidalarni o'zgartirmang.\n\n4. Maqtang - Yaxshi xulq uchun rag'batlantiring.", type: 'article', orderIndex: 3 },
      { categoryId: categories[1]._id, title: 'Maktabga tayyorgarlik', content: "Bolani maktabga qanday tayyorlash kerak.\n\nMaktabga tayyorgarlik faqat o'qish-yozishni o'rganish emas:\n\n1. Ijtimoiy ko'nikmalar - Boshqa bolalar bilan muloqot.\n\n2. Mustaqillik - O'z-o'ziga xizmat qilish.\n\n3. Diqqat - 15-20 daqiqa bir ishga e'tibor berish.\n\n4. Qiziqish - O'rganishga ishtiyoq uyg'otish.", type: 'article', orderIndex: 1 },
      { categoryId: categories[1]._id, title: "O'qishga qiziqtirish", content: "Bolani o'qishga qanday qiziqtirish mumkin.\n\nO'qishga muhabbatni erta yoshdan shakllantirish kerak:\n\n1. Har kuni kitob o'qing - Uxlashdan oldin ertak.\n\n2. Kutubxonaga boring - Kitoblar dunyosini ko'rsating.\n\n3. Namuna bo'ling - O'zingiz ham kitob o'qing.\n\n4. Muhokama qiling - O'qilgan kitob haqida gaplashing.", type: 'article', orderIndex: 2 },
      { categoryId: categories[2]._id, title: 'Bolada ishonchni shakllantirish', content: "Bolaning o'ziga bo'lgan ishonchini qanday mustahkamlash.\n\nO'ziga ishonch - hayotda muvaffaqiyatning kaliti:\n\n1. Maqtang - Harakatni, natijani emas.\n\n2. Xatoga yo'l qo'ying - Xatolardan o'rganishga imkon bering.\n\n3. Mas'uliyat bering - Yoshiga mos vazifalar.\n\n4. Tinglang - Fikrlarini hurmat qiling.", type: 'article', orderIndex: 1 },
      { categoryId: categories[2]._id, title: "Qo'rquvlar bilan ishlash", content: "Bolalardagi qo'rquvlarni yengish usullari.\n\nQo'rquv - tabiiy his-tuyg'u, lekin uni boshqarish kerak:\n\n1. Jiddiy qabul qiling - \"Qo'rqma\" demang.\n\n2. Gaplashing - Nimadan qo'rqayotganini so'rang.\n\n3. Asta-sekin yondashing - Qo'rqitadigan narsaga sekin-asta yaqinlashtiring.\n\n4. Xavfsizlik hissi - Yoningizda ekanligingizni bildiring.", type: 'article', orderIndex: 2 },
      { categoryId: categories[3]._id, title: 'Samarali muloqot', content: 'Bola bilan samarali muloqot qilish sirlari.\n\nYaxshi muloqot - yaxshi munosabatlar asosi:\n\n1. Ko\'z kontakti - Gaplashganda ko\'ziga qarang.\n\n2. Faol tinglash - Gaplariga e\'tibor bering.\n\n3. Ochiq savollar - \"Ha/Yo\'q\" emas, batafsil javob talab qiluvchi savollar.\n\n4. His-tuyg\'ularni tan oling - \"Tushunaman, bu qiyin bo\'lgan\".', type: 'article', orderIndex: 1 },
      { categoryId: categories[4]._id, title: 'Kundalik tartib', content: "Bolada kundalik tartibni shakllantirish.\n\nTartib bolaga xavfsizlik hissi beradi:\n\n1. Doimiy vaqt - Uxlash, ovqatlanish bir vaqtda.\n\n2. Vizual jadval - Rasmli kun tartibi.\n\n3. Ogohlantirish - O'zgarishlar haqida oldindan ayting.\n\n4. Moslashuvchanlik - Ba'zan istisno qilish mumkin.", type: 'article', orderIndex: 1 },
      { categoryId: categories[5]._id, title: "To'g'ri ovqatlanish", content: "Bolalarning to'g'ri ovqatlanishi haqida.\n\nSog'lom ovqatlanish - sog'lom rivojlanish:\n\n1. Rang-barang - Turli rangdagi sabzavotlar.\n\n2. Birga ovqatlaning - Oilaviy dasturxon.\n\n3. Majburlamang - Ishtahasi bo'lmasa, kutib turing.\n\n4. Namuna - O'zingiz ham sog'lom ovqatlaning.", type: 'article', orderIndex: 1 },
    ];

    await Lesson.insertMany(lessons);
    console.log("Boshlang'ich ma'lumotlar qo'shildi");
  }
}

export default mongoose;
