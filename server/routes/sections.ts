import { Router } from 'express';
import { Section, Category, Lesson } from '../db';

const router = Router();

// Get all sections
router.get('/', async (req, res) => {
  try {
    const sections = await Section.find().sort({ orderIndex: 1 });
    
    // Get category count for each section
    const sectionsWithCount = await Promise.all(
      sections.map(async (section) => {
        const categoryCount = await Category.countDocuments({ sectionId: section._id });
        return {
          id: section._id,
          name: section.name,
          icon: section.icon,
          color: section.color,
          orderIndex: section.orderIndex,
          status: section.status || 'active',
          categoryCount
        };
      })
    );
    
    res.json(sectionsWithCount);
  } catch (error) {
    res.status(500).json({ error: "Bo'limlarni olishda xatolik" });
  }
});

// Get single section with categories
router.get('/:id', async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ error: "Bo'lim topilmadi" });
    }
    
    const categories = await Category.find({ sectionId: section._id }).sort({ orderIndex: 1 });
    
    // Get lesson count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (c) => {
        const lessonCount = await Lesson.countDocuments({ categoryId: c._id });
        return {
          id: c._id,
          name: c.name,
          description: c.description,
          icon: c.icon,
          color: c.color,
          orderIndex: c.orderIndex || 0,
          status: c.status || 'active',
          lessonCount
        };
      })
    );
    
    res.json({
      id: section._id,
      name: section.name,
      icon: section.icon,
      color: section.color,
      orderIndex: section.orderIndex,
      status: section.status || 'active',
      categories: categoriesWithCount
    });
  } catch (error) {
    res.status(500).json({ error: "Bo'limni olishda xatolik" });
  }
});

// Create section (admin only)
router.post('/', async (req: any, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Ruxsat berilmagan' });
  }
  
  try {
    const { name, icon, color, orderIndex } = req.body;
    let finalOrderIndex = orderIndex;
    
    if (finalOrderIndex === undefined) {
      const lastSection = await Section.findOne().sort({ orderIndex: -1 });
      finalOrderIndex = lastSection ? lastSection.orderIndex + 1 : 0;
    }
    
    const section = await Section.create({
      name,
      icon: icon || 'folder',
      color: color || 'from-emerald-500 to-emerald-600',
      orderIndex: finalOrderIndex
    });
    
    res.status(201).json({
      id: section._id,
      name: section.name,
      icon: section.icon,
      color: section.color,
      orderIndex: section.orderIndex,
      categoryCount: 0
    });
  } catch (error) {
    res.status(500).json({ error: "Bo'lim yaratishda xatolik" });
  }
});

// Update section (admin only)
router.put('/:id', async (req: any, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Ruxsat berilmagan' });
  }
  
  try {
    const { name, icon, color, orderIndex, status } = req.body;
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { name, icon, color, orderIndex: orderIndex ?? 0, status: status || 'active' },
      { new: true }
    );
    
    if (!section) {
      return res.status(404).json({ error: "Bo'lim topilmadi" });
    }
    
    res.json({
      id: section._id,
      name: section.name,
      icon: section.icon,
      color: section.color,
      orderIndex: section.orderIndex,
      status: section.status
    });
  } catch (error) {
    res.status(500).json({ error: "Bo'limni yangilashda xatolik" });
  }
});

// Delete section (admin only)
router.delete('/:id', async (req: any, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Ruxsat berilmagan' });
  }
  
  try {
    const { keepCategories } = req.query;
    
    if (keepCategories === 'true') {
      // Kategoriyalarni saqlab qolish - sectionId ni null qilish
      await Category.updateMany({ sectionId: req.params.id }, { sectionId: null });
    } else {
      // Kategoriyalar va ularning darslarini o'chirish
      const categories = await Category.find({ sectionId: req.params.id });
      for (const cat of categories) {
        await Lesson.deleteMany({ categoryId: cat._id });
      }
      await Category.deleteMany({ sectionId: req.params.id });
    }
    
    await Section.findByIdAndDelete(req.params.id);
    res.json({ message: "Bo'lim o'chirildi" });
  } catch (error) {
    res.status(500).json({ error: "Bo'limni o'chirishda xatolik" });
  }
});

export default router;
