import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { categoriesAPI, sectionsAPI } from '../api';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  lessonCount: number;
}

interface Section {
  id: string;
  name: string;
}

export function Kategoriyalar() {
  const [searchParams] = useSearchParams();
  const bolimId = searchParams.get('bolim');
  const [categories, setCategories] = useState<Category[]>([]);
  const [, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { user, isAdmin, isSubscribed, subscription } = useAuth();

  useEffect(() => {
    loadData();
  }, [bolimId]);

  const loadData = async () => {
    try {
      const res = await categoriesAPI.getAll(bolimId || undefined);
      setCategories(res.data);
      
      if (bolimId) {
        const secRes = await sectionsAPI.getOne(bolimId);
        setSection(secRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const colorClasses: Record<string, { bg: string; gradient: string }> = {
    green: { bg: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600' },
    blue: { bg: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600' },
    red: { bg: 'bg-red-500', gradient: 'from-red-500 to-red-600' },
    purple: { bg: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600' },
    orange: { bg: 'bg-orange-500', gradient: 'from-orange-500 to-orange-600' },
    teal: { bg: 'bg-teal-500', gradient: 'from-teal-500 to-teal-600' },
  };

  return (
    <div className="min-h-screen bg-slate-50 font-display">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src="/uploads/logo/gr.png" alt="Logo" className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl object-cover" />
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-[0.3em] sm:tracking-[0.35em] lg:tracking-[0.4em] ml-[2px]">mukammal</span>
                <span className="text-base sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent -mt-1">OTA-ONA</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-medium transition-colors text-sm">
                  <span className="material-symbols-outlined text-lg sm:text-xl">admin_panel_settings</span>
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              {!isAdmin && subscription && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-sm ${
                  subscription.daysLeft <= 3 ? 'bg-red-100 text-red-700' :
                  subscription.daysLeft <= 5 ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  <span>{subscription.daysLeft} kun qoldi</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-12 mb-6 sm:mb-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative z-10">
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">Xush kelibsiz, {user?.fullName?.split(' ')[0]}! 👋</h1>
            <p className="text-emerald-100 text-sm sm:text-lg max-w-2xl">Bugun qaysi mavzu bo'yicha o'rganmoqchisiz?</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 sm:mb-8">
          <div className="relative max-w-xl">
            <span className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-xl">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 bg-white border-2 border-slate-100 rounded-xl sm:rounded-2xl focus:border-primary outline-none transition-all text-slate-900 font-medium shadow-sm text-sm sm:text-base"
              placeholder="Qidirish..."
            />
          </div>
        </div>

        {/* Subscription Banner */}
        {!isSubscribed && !isAdmin && (
          <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <span className="material-symbols-outlined text-xl sm:text-2xl">info</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-800 text-sm sm:text-base">Obuna faol emas</p>
              <p className="text-amber-700 text-xs sm:text-sm">Barcha kategoriyalarni ochish uchun obunani faollashtiring. Hozircha faqat birinchi kategoriya ochiq.</p>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl">
            <span className="material-symbols-outlined text-7xl text-slate-200 mb-4">search_off</span>
            <p className="text-xl text-slate-500">Kategoriya topilmadi</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {filteredCategories.map((category, index) => {
              const isLocked = !isSubscribed && !isAdmin && index > 0;
              
              if (isLocked) {
                return (
                  <div
                    key={category.id}
                    onClick={() => setShowSubscriptionModal(true)}
                    className="group bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm border border-slate-100 relative overflow-hidden cursor-pointer opacity-75 hover:opacity-100 transition-opacity"
                  >
                    {/* Lock overlay */}
                    <div className="absolute inset-0 bg-slate-900/5 z-10 flex items-center justify-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-900/80 flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-2xl sm:text-3xl">lock</span>
                      </div>
                    </div>
                    
                    <div className={`absolute top-0 right-0 w-24 sm:w-40 h-24 sm:h-40 ${colorClasses[category.color]?.bg || 'bg-emerald-500'} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2`}></div>
                    
                    <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${colorClasses[category.color]?.gradient || 'from-emerald-500 to-emerald-600'} flex items-center justify-center text-white mb-3 sm:mb-6 shadow-lg grayscale`}>
                      <span className="material-symbols-outlined text-xl sm:text-3xl">{category.icon}</span>
                    </div>
                    
                    <h3 className="text-sm sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2">{category.name}</h3>
                    <p className="text-slate-600 mb-3 sm:mb-6 text-xs sm:text-base line-clamp-2">{category.description}</p>
                    
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-1 sm:gap-2 text-slate-500">
                        <span className="material-symbols-outlined text-sm sm:text-lg">school</span>
                        <span className="font-medium text-xs sm:text-base">{category.lessonCount} ta dars</span>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-lg sm:text-2xl">lock</span>
                      </div>
                    </div>
                  </div>
                );
              }
              
              return (
                <Link
                  key={category.id}
                  to={`/kategoriya/${category.id}`}
                  className="group bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-24 sm:w-40 h-24 sm:h-40 ${colorClasses[category.color]?.bg || 'bg-emerald-500'} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`}></div>
                  
                  {/* Free badge for first category */}
                  {index === 0 && !isSubscribed && !isAdmin && (
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg">
                      BEPUL
                    </div>
                  )}
                  
                  <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${colorClasses[category.color]?.gradient || 'from-emerald-500 to-emerald-600'} flex items-center justify-center text-white mb-3 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <span className="material-symbols-outlined text-xl sm:text-3xl">{category.icon}</span>
                  </div>
                  
                  <h3 className="text-sm sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2 group-hover:text-primary transition-colors">{category.name}</h3>
                  <p className="text-slate-600 mb-3 sm:mb-6 text-xs sm:text-base line-clamp-2">{category.description}</p>
                  
                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1 sm:gap-2 text-slate-500">
                      <span className="material-symbols-outlined text-sm sm:text-lg">school</span>
                      <span className="font-medium text-xs sm:text-base">{category.lessonCount} ta dars</span>
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 group-hover:bg-primary flex items-center justify-center text-slate-400 group-hover:text-white transition-all">
                      <span className="material-symbols-outlined text-lg sm:text-2xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowSubscriptionModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-5 sm:p-6 shadow-2xl">
            <button onClick={() => setShowSubscriptionModal(false)} className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-2xl text-amber-600">lock</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Obuna talab qilinadi</h2>
              <p className="text-slate-600 text-sm">
                Barcha kategoriyalarni ochish uchun oylik obunani faollashtiring.
              </p>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 text-white text-center mb-4">
              <p className="text-emerald-100 text-xs mb-1">Oylik obuna narxi</p>
              <p className="text-2xl font-bold">50,000 so'm</p>
            </div>
            
            {/* Card Number */}
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <p className="text-slate-500 text-xs mb-2">To'lov uchun karta raqami:</p>
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-900 text-lg tracking-wider">5614 6827 1416 5471</p>
                <button 
                  onClick={() => navigator.clipboard.writeText('5614682714165471')}
                  className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                  title="Nusxalash"
                >
                  <span className="material-symbols-outlined text-lg">content_copy</span>
                </button>
              </div>
              <p className="text-slate-500 text-xs mt-1">Hakimov Javohir</p>
            </div>

            {/* Telegram */}
            <a
              href="https://t.me/mukammal_tarbiya"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#0088cc] text-white rounded-xl font-semibold hover:bg-[#0077b5] transition-colors mb-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
              Telegram orqali yozish
            </a>
            
            <button
              onClick={() => setShowSubscriptionModal(false)}
              className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors text-sm"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}




