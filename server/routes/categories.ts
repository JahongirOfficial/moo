import { Router } from 'express';
import { Category, Lesson } from '../db';
import { authenticateToken, isAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const { sectionId } = req.query;
    const filter: any = {};
    if (sectionId) {
      filter.sectionId = sectionId;
    }
    
    const categories = await Category.find(filter).sort({ orderIndex: -1 });
    
    // Get lesson count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const lessonCount = await Lesson.countDocuments({ categoryId: cat._id });
        return { ...cat.toObject(), id: cat._id, lessonCount };
      })
    );
    
    res.json(categoriesWithCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Get single category with lessons
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Kategoriya topilmadi' });
    }

    const lessons = await Lesson.find({ categoryId: req.params.id }).sort({ orderIndex: -1 });
    const lessonsWithId = lessons.map(l => ({ ...l.toObject(), id: l._id }));
    
    res.json({ ...category.toObject(), id: category._id, lessons: lessonsWithId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Create category (admin only)
router.post('/', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const { sectionId, name, description, icon, color, orderIndex, status } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Kategoriya nomi kiritilishi shart' });
    }

    // Agar orderIndex berilmagan bo'lsa, eng katta orderIndex + 1 ni olish
    let newOrderIndex = orderIndex;
    if (newOrderIndex === undefined || newOrderIndex === null) {
      const filter: any = {};
      if (sectionId) filter.sectionId = sectionId;
      const maxCategory = await Category.findOne(filter).sort({ orderIndex: -1 });
      newOrderIndex = (maxCategory?.orderIndex || 0) + 1;
    }

    const category = await Category.create({
      sectionId: sectionId || null,
      name,
      description: description || '',
      icon: icon || 'category',
      color: color || 'green',
      orderIndex: newOrderIndex,
      status: status || 'active'
    });

    res.json({ ...category.toObject(), id: category._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Update category (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const { sectionId, name, description, icon, color, orderIndex, status } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { sectionId, name, description, icon, color, orderIndex, status },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Kategoriya topilmadi' });
    }

    res.json({ ...category.toObject(), id: category._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Kategoriya topilmadi' });
    }

    // Delete all lessons in this category
    await Lesson.deleteMany({ categoryId: req.params.id });

    res.json({ message: "Kategoriya o'chirildi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

export default router;
