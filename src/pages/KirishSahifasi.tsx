import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function KirishSahifasi() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [phone, setPhone] = useState('+998 ');
  const [password, setPassword] = useState('');

  // Telefon raqamni formatlash: +998 XX XXX XX XX
  const formatPhone = (value: string) => {
    // Faqat raqamlarni olish
    const numbers = value.replace(/\D/g, '');
    
    // +998 dan keyin 9 ta raqam
    let formatted = '+998 ';
    if (numbers.length > 3) {
      const rest = numbers.slice(3, 12); // 998 dan keyingi 9 ta raqam
      if (rest.length > 0) formatted += rest.slice(0, 2);
      if (rest.length > 2) formatted += ' ' + rest.slice(2, 5);
      if (rest.length > 5) formatted += ' ' + rest.slice(5, 7);
      if (rest.length > 7) formatted += ' ' + rest.slice(7, 9);
    }
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(phone, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 font-display flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-700"></div>
        <img 
          src="https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=1200" 
          alt="Family" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
        />
        <div className="relative z-10 flex flex-col justify-center p-16 text-white">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">family_star</span>
            </div>
            <span className="text-2xl font-bold">Mukammal Ota Ona</span>
          </Link>
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Farzand tarbiyasida yangi bosqichga o'ting
          </h1>
          <p className="text-xl text-emerald-100 mb-8">
            10,000+ ota-onalar allaqachon bizga qo'shildi va natijalarni ko'rmoqda.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {['women/44', 'men/32', 'women/68', 'men/45'].map((img, i) => (
                <img key={i} src={`https://randomuser.me/api/portraits/${img}.jpg`} className="w-10 h-10 rounded-full border-2 border-white" alt="" />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <p className="text-sm text-emerald-200">10,000+ ijobiy fikr</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-3xl">family_star</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">Mukammal Ota Ona</span>
          </Link>

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">
              Admin Panel
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Administrator sifatida kirish
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Telefon raqam</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined">call</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-primary outline-none transition-all text-slate-900 font-medium"
                  placeholder="+998 90 123 45 67"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Parol</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-14 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-primary outline-none transition-all text-slate-900 font-medium"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Kirish
                  <span className="material-symbols-outlined">login</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}




