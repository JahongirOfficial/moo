import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, usersAPI } from '../api';

interface User {
  id: string;
  fullName: string;
  phone: string;
  role: 'user' | 'admin';
}

interface SubscriptionStatus {
  isSubscribed: boolean;
  subscriptionActive: boolean;
  subscriptionEndDate: string | null;
  daysLeft: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  subscription: SubscriptionStatus | null;
  login: (phone: string, password: string) => Promise<void>;
  register: (fullName: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isSubscribed: boolean;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Har 5 soniyada subscription statusni serverdan yangilash (realtime sync)
  useEffect(() => {
    if (!user || user.role === 'admin') return;
    
    const interval = setInterval(() => {
      refreshSubscription();
    }, 5000); // 5 soniya
    
    return () => clearInterval(interval);
  }, [user]);

  const loadUser = async () => {
    try {
      const res = await authAPI.getMe();
      setUser(res.data);
      // Load subscription status
      if (res.data.role !== 'admin') {
        await refreshSubscription();
      }
    } catch (err: any) {
      // Faqat 401 (unauthorized) da logout, boshqa xatoliklarda emas
      if (err?.response?.status === 401) {
        localStorage.removeItem('token');
      }
      // 403, 500 va boshqa xatoliklarda token saqlanadi
    } finally {
      setLoading(false);
    }
  };


  const refreshSubscription = async () => {
    try {
      const res = await usersAPI.getMySubscription();
      setSubscription(res.data);
    } catch (err) {
      console.error('Subscription check failed:', err);
    }
  };

  const login = async (phone: string, password: string) => {
    const res = await authAPI.login(phone, password);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    if (res.data.user.role !== 'admin') {
      await refreshSubscription();
    }
  };

  const register = async (fullName: string, phone: string, password: string) => {
    const res = await authAPI.register(fullName, phone, password);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    await refreshSubscription();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setSubscription(null);
  };

  const isAdmin = user?.role === 'admin';
  const isSubscribed = isAdmin || subscription?.subscriptionActive || false;

  return (
    <AuthContext.Provider value={{ 
      user, loading, subscription, login, register, logout, 
      isAdmin, isSubscribed, refreshSubscription 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}



