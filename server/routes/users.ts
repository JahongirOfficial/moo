import { Router } from 'express';
import { User } from '../db';
import { authenticateToken, isAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all users (admin only)
router.get('/', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    const usersWithStatus = users.map(user => {
      const now = new Date();
      const isActive = user.subscriptionEnd && new Date(user.subscriptionEnd) > now;
      return {
        ...user.toObject(),
        id: user._id,
        subscriptionActive: isActive
      };
    });

    res.json(usersWithStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Get single user (admin only)
router.get('/:id', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }
    res.json({ ...user.toObject(), id: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Update user subscription (admin only)
router.put('/:id/subscription', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const { isSubscribed, days } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }

    if (isSubscribed && days) {
      // Activate subscription for X days
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
      user.isSubscribed = true;
      user.subscriptionEnd = endDate;
    } else {
      // Deactivate subscription
      user.isSubscribed = false;
      user.subscriptionEnd = null;
    }

    await user.save();

    res.json({ 
      message: isSubscribed ? 'Obuna faollashtirildi' : 'Obuna bekor qilindi',
      user: { ...user.toObject(), id: user._id, password: undefined }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }
    res.json({ message: "Foydalanuvchi o'chirildi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Get current user subscription status
router.get('/me/subscription', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }

    const now = new Date();
    const isActive = user.subscriptionEnd && new Date(user.subscriptionEnd) > now;
    
    res.json({
      isSubscribed: isActive,
      subscriptionEnd: user.subscriptionEnd,
      subscriptionActive: isActive,
      daysLeft: isActive ? Math.ceil((new Date(user.subscriptionEnd!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

export default router;
