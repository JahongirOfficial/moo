import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sectionsAPI } from '../api';

interface Section {
  id: string;
  name: string;
  icon: string;
  color: string;
  orderIndex: number;
  status: 'active' | 'pause';
  categoryCount: number;
}

export function BolimTanlash() {
  const { user, isAdmin } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pausedSectionName, setPausedSectionName] = useState('');

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const res = await sectionsAPI.getAll();
      setSections(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 mb-6 sm:mb-8 lg:mb-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 sm:w-40 md:w-52 lg:w-64 h-32 sm:h-40 md:h-52 lg:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 sm:w-32 md:w-40 lg:w-48 h-24 sm:h-32 md:h-40 lg:h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative z-10">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold mb-1 sm:mb-2 lg:mb-3">Xush kelibsiz, {user?.fullName?.split(' ')[0]}! 👋</h1>
            <p className="text-emerald-100 text-xs sm:text-sm md:text-base lg:text-lg max-w-2xl">Farzandlaringizni dunyo darajasiga olib chiqamiz</p>
          </div>
        </div>

        {/* Bo'limlar */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl">
            <span className="material-symbols-outlined text-7xl text-slate-200 mb-4">folder_off</span>
            <p className="text-xl text-slate-500">Hali bo'limlar qo'shilmagan</p>
            {isAdmin && (
              <Link to="/admin/bolimlar" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold">
                <span className="material-symbols-outlined">add</span>
                Bo'lim qo'shish
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sections.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)).map((section, index) => {
              const isPaused = section.status === 'pause' && !isAdmin;
              const prevSection = sections.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))[index - 1];
              
              const handleClick = (e: React.MouseEvent) => {
                // Pause check only
                if (isPaused) {
                  e.preventDefault();
                  setPausedSectionName(prevSection?.name || 'oldingi bo\'lim');
                  setShowPauseModal(true);
                }
              };
              
              return (
                <Link
                  key={section.id}
                  to={isPaused ? '#' : `/kategoriya/${section.id}`}
                  onClick={handleClick}
                  className={`group flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 bg-white shadow-sm transition-all duration-300 border-y border-slate-100 ${isPaused ? 'opacity-60' : 'hover:shadow-md hover:bg-emerald-50'}`}
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center text-white shadow ${isPaused ? 'grayscale' : ''}`}>
                    <span className="material-symbols-outlined text-lg sm:text-xl">{isPaused ? 'lock' : section.icon}</span>
                  </div>
                  <div className="flex-1">
                    <span className={`font-semibold transition-colors text-sm sm:text-base ${isPaused ? 'text-slate-500' : 'text-slate-700 group-hover:text-emerald-600'}`}>{section.name}</span>
                    <p className="text-xs text-slate-500">{section.categoryCount} ta kategoriya</p>
                  </div>
                  <span className={`material-symbols-outlined transition-all ${isPaused ? 'text-slate-300' : 'text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1'}`}>
                    {isPaused ? 'lock' : 'chevron_right'}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* Pause Modal */}
      {showPauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowPauseModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-amber-600">lock</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Bo'lim qulflangan</h3>
            <p className="text-slate-600 text-sm mb-6">
              Bu bo'limni ochish uchun avval <strong>"{pausedSectionName}"</strong> bo'limini tugatishingiz kerak.
            </p>
            <button
              onClick={() => setShowPauseModal(false)}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold"
            >
              Tushundim
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
