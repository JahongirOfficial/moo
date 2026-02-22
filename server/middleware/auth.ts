import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'mukammal-ota-ona-secret-key-2024';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    phone: string;
    role: string;
    isSubscribed?: boolean;
    subscriptionEndDate?: Date;
  };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  // Check header first, then query parameter (for video streaming)
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  
  // If no header token, check query parameter
  if (!token && req.query.token) {
    token = req.query.token as string;
  }

  if (!token) {
    return res.status(401).json({ error: 'Token topilmadi' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token yaroqsiz' });
    }
    req.user = user as AuthRequest['user'];
    next();
  });
}

export function isAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin huquqi talab qilinadi' });
  }
  next();
}

// Check if user has active subscription
export async function checkSubscription(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Admin always has access
    if (req.user?.role === 'admin') {
      return next();
    }

    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }

    // Check subscription status
    const now = new Date();
    const isActive = user.subscriptionEnd && new Date(user.subscriptionEnd) > now;

    if (!isActive) {
      return res.status(403).json({ 
        error: 'Obuna faol emas', 
        code: 'SUBSCRIPTION_REQUIRED',
        message: "Darslarni ko'rish uchun obuna sotib oling"
      });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server xatosi' });
  }
}

export { JWT_SECRET };
