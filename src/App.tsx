import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AiChat } from './components/AiChat';
// import { PwaInstallBanner } from './components/PwaInstallBanner';

// Lazy loaded pages
const KirishSahifasi = lazy(() => import('./pages/KirishSahifasi').then(m => ({ default: m.KirishSahifasi })));
const BolimTanlash = lazy(() => import('./pages/BolimTanlash').then(m => ({ default: m.BolimTanlash })));
const KategoriyaBolimi = lazy(() => import('./pages/KategoriyaBolimi').then(m => ({ default: m.KategoriyaBolimi })));
const DarsSahifasi = lazy(() => import('./pages/DarsSahifasi').then(m => ({ default: m.DarsSahifasi })));
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel').then(m => ({ default: m.AdminPanel })));
const AdminKategoriyalar = lazy(() => import('./pages/admin/AdminKategoriyalar').then(m => ({ default: m.AdminKategoriyalar })));
const AdminDarslar = lazy(() => import('./pages/admin/AdminDarslar').then(m => ({ default: m.AdminDarslar })));
const AdminFoydalanuvchilar = lazy(() => import('./pages/admin/AdminFoydalanuvchilar').then(m => ({ default: m.AdminFoydalanuvchilar })));
const AdminBolimlar = lazy(() => import('./pages/admin/AdminBolimlar').then(m => ({ default: m.AdminBolimlar })));
const AdminSMS = lazy(() => import('./pages/admin/AdminSMS').then(m => ({ default: m.AdminSMS })));

// Loading spinner
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
    </div>
  );
}

// Protected Route - Removed (no longer needed)
// All routes are now public except admin routes

// Admin Route
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) return <PageLoader />;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public - Redirect to /bolim */}
        <Route path="/" element={<Navigate to="/bolim" replace />} />
        
        {/* Admin Login */}
        <Route path="/login" element={<KirishSahifasi />} />
        
        {/* Public Routes - No Auth Required */}
        <Route path="/bolim" element={<BolimTanlash />} />
        <Route path="/kategoriya/:id" element={<KategoriyaBolimi />} />
        <Route path="/dars/:id" element={<DarsSahifasi />} />
        
        {/* Admin Routes - Auth Required */}
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/admin/bolimlar" element={<AdminRoute><AdminBolimlar /></AdminRoute>} />
        <Route path="/admin/kategoriyalar" element={<AdminRoute><AdminKategoriyalar /></AdminRoute>} />
        <Route path="/admin/darslar" element={<AdminRoute><AdminDarslar /></AdminRoute>} />
        <Route path="/admin/darslar/:categoryId" element={<AdminRoute><AdminDarslar /></AdminRoute>} />
        <Route path="/admin/foydalanuvchilar" element={<AdminRoute><AdminFoydalanuvchilar /></AdminRoute>} />
        <Route path="/admin/sms" element={<AdminRoute><AdminSMS /></AdminRoute>} />
      </Routes>
    </Suspense>
  );
}

function AiChatWrapper() {
  // AI Chat is now available for everyone
  return <AiChat />;
}

function PwaBannerWrapper() {
  // const { user } = useAuth();
  // if (!user) return null;
  // return <PwaInstallBanner />;
  return null; // Vaqtincha o'chirilgan
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <PwaBannerWrapper />
        <AppRoutes />
        <AiChatWrapper />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
