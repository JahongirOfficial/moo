import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { sectionsAPI, lessonsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: string;
  orderIndex: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  orderIndex?: number;
  status?: 'active' | 'pause';
  lessonCount?: number;
}

interface Section {
  id: string;
  name: string;
  icon: string;
  color: string;
  status: 'active' | 'pause';
  orderIndex: number;
  categories: Category[];
}

export function KategoriyaBolimi() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, subscription } = useAuth();
  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [pausedSectionName, setPausedSectionName] = useState('');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categoryLessons, setCategoryLessons] = useState<Record<string, Lesson[]>>({});
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pausedCategoryName, setPausedCategoryName] = useState('');
  const [loadingLessons, setLoadingLessons] = useState<string | null>(null);

  useEffect(() => {
    loadSection();
    const completed = JSON.parse(localStorage.getItem('completedLessons') || '[]');
    setCompletedLessons(completed);
  }, [id]);

  const loadSection = async () => {
    try {
      // Bitta so'rov bilan section va uning kategoriyalarini olish
      const res = await sectionsAPI.getOne(id!);
      
      // Agar pause bo'lsa va admin bo'lmasa, tekshirish
      if (!isAdmin && res.data.status === 'pause') {
        // Oldingi bo'lim nomini olish uchun barcha bo'limlarni so'rash
        const allSectionsRes = await sectionsAPI.getAll();
        const allSections = allSectionsRes.data.sort((a: Section, b: Section) => (a.orderIndex || 0) - (b.orderIndex || 0));
        const currentIndex = allSections.findIndex((s: Section) => s.id === id);
        const prevSection = allSections[currentIndex - 1];
        setPausedSectionName(prevSection?.name || 'oldingi bo\'lim');
        setAccessDenied(true);
        setLoading(false);
        return;
      }
      
      setSection(res.data);
    } catch (err: any) {
      navigate('/bolim');
    } finally {
      setLoading(false);
    }
  };


  const loadCategoryLessons = async (categoryId: string) => {
    if (categoryLessons[categoryId]) return;
    setLoadingLessons(categoryId);
    try {
      const res = await lessonsAPI.getAll(categoryId);
      setCategoryLessons(prev => ({ ...prev, [categoryId]: res.data }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLessons(null);
    }
  };

  const toggleCategory = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
      loadCategoryLessons(categoryId);
    }
  };

  const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
    article: { icon: 'article', label: 'Maqola', color: 'bg-emerald-100 text-emerald-600' },
    video: { icon: 'play_circle', label: 'Video', color: 'bg-emerald-100 text-emerald-600' },
    audio: { icon: 'headphones', label: 'Audio', color: 'bg-orange-100 text-orange-600' },
  };

  const colorClasses: Record<string, { bg: string; gradient: string; light: string }> = {
    green: { bg: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50' },
    blue: { bg: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50' },
    red: { bg: 'bg-red-500', gradient: 'from-red-500 to-red-600', light: 'bg-red-50' },
    purple: { bg: 'bg-purple-500', gradient: 'from-purple-500 to-purple-600', light: 'bg-purple-50' },
    orange: { bg: 'bg-orange-500', gradient: 'from-orange-500 to-orange-600', light: 'bg-orange-50' },
    teal: { bg: 'bg-teal-500', gradient: 'from-teal-500 to-teal-600', light: 'bg-teal-50' },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-sm w-full text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-3xl text-amber-600">lock</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Bo'lim qulflangan</h2>
          <p className="text-slate-600 mb-5 text-sm">
            Bu bo'limni ochish uchun avval <strong>"{pausedSectionName}"</strong> bo'limini tugatishingiz kerak.
          </p>
          <Link to="/bolim" className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold text-sm">
            <span className="material-symbols-outlined text-lg">arrow_back</span>Orqaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  if (!section) return null;

  const colors = colorClasses[section.color] || colorClasses.green;


  return (
    <div className="min-h-screen bg-slate-50 font-display">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 sm:h-16 lg:h-20 gap-3 sm:gap-4">
            <button onClick={() => navigate('/bolim')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <span className="material-symbols-outlined text-slate-600">arrow_back</span>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-slate-900 truncate">{section.name}</h1>
              <p className="text-xs sm:text-sm text-slate-500">{section.categories?.length || 0} ta kategoriya</p>
            </div>
            {!isAdmin && subscription && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold text-xs sm:text-sm ${
                subscription.daysLeft <= 3 ? 'bg-red-100 text-red-700' :
                subscription.daysLeft <= 5 ? 'bg-amber-100 text-amber-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                <span>{subscription.daysLeft} kun qoldi</span>
              </div>
            )}
            <Link to="/bolim" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <span className="material-symbols-outlined text-slate-600">home</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
        {/* Section Hero - Desktop only */}
        <div className={`hidden sm:block bg-gradient-to-br ${colors.gradient} rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-12 mb-6 sm:mb-10 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl sm:text-5xl lg:text-6xl">{section.icon}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">{section.name}</h2>
              <p className="text-white/80 text-sm sm:text-lg">Kategoriyalarni tanlang va darslarni boshlang</p>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 mt-2 sm:mt-0">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{section.categories?.length || 0}</p>
                <p className="text-white/70 text-xs sm:text-sm">Kategoriya</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <h3 className="text-base sm:text-xl font-bold text-slate-900">Kategoriyalar</h3>
          <span className="text-xs sm:text-sm text-slate-500">{section.categories?.length || 0} ta</span>
        </div>
        
        {!section.categories || section.categories.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-10 sm:p-16 text-center">
            <div className={`w-16 sm:w-20 h-16 sm:h-20 rounded-xl sm:rounded-2xl ${colors.light} flex items-center justify-center mx-auto mb-4 sm:mb-6`}>
              <span className="material-symbols-outlined text-3xl sm:text-4xl text-slate-400">folder_off</span>
            </div>
            <p className="text-base sm:text-xl text-slate-500">Bu bo'limda hali kategoriyalar yo'q</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {section.categories.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)).map((category, catIndex) => {
              const catColors = colorClasses[category.color] || colorClasses.green;
              const isExpanded = expandedCategory === category.id;
              const lessons = categoryLessons[category.id] || [];
              const sortedCategories = [...section.categories].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
              const prevCategory = sortedCategories[catIndex - 1];
              const isPaused = !isAdmin && category.status === 'pause';

              const handleCategoryClick = () => {
                if (isPaused) {
                  setPausedCategoryName(prevCategory?.name || 'oldingi kategoriya');
                  setShowPauseModal(true);
                } else {
                  toggleCategory(category.id);
                }
              };
              
              return (
                <div key={category.id} className={`bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${isPaused ? 'opacity-70' : ''}`}>
                  {/* Category Header */}
                  <button
                    onClick={handleCategoryClick}
                    className={`w-full flex items-center gap-3 sm:gap-4 lg:gap-6 p-4 sm:p-5 lg:p-6 transition-all ${isPaused ? 'cursor-pointer' : 'hover:bg-slate-50'}`}
                  >
                    <div className={`w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${isPaused ? 'from-slate-400 to-slate-500' : catColors.gradient} flex items-center justify-center text-white font-bold text-base sm:text-xl lg:text-2xl shrink-0 shadow-lg`}>
                      <span className="material-symbols-outlined text-xl sm:text-2xl lg:text-3xl">{isPaused ? 'lock' : category.icon}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-bold text-sm sm:text-lg mb-1 truncate ${isPaused ? 'text-slate-500' : 'text-slate-900'}`}>{category.name}</h4>

                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 truncate">{category.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xs sm:text-sm text-slate-500">{category.lessonCount || 0} dars</span>
                      {isPaused ? (
                        <span className="material-symbols-outlined text-slate-400">lock</span>
                      ) : (
                        <span className={`material-symbols-outlined text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                      )}
                    </div>
                  </button>
                  
                  {/* Lessons Dropdown */}
                  {isExpanded && !isPaused && (
                    <div className="border-t border-slate-100 bg-slate-50 p-3 sm:p-4">
                      {loadingLessons === category.id ? (
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl animate-pulse">
                              <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                              </div>
                              <div className="w-6 h-6 rounded bg-slate-100"></div>
                            </div>
                          ))}
                        </div>
                      ) : lessons.length === 0 ? (
                        <p className="text-center text-slate-500 py-4 text-sm">Bu kategoriyada hali darslar yo'q</p>
                      ) : (
                        <div className="space-y-2">
                          {lessons.map((lesson, index) => {
                            const type = typeConfig[lesson.type] || typeConfig.article;
                            const isLessonCompleted = completedLessons.includes(lesson.id);
                            
                            return (
                              <Link key={lesson.id} to={`/dars/${lesson.id}`} className="group flex items-start gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-all">
                                <div className={`w-8 h-8 rounded-lg ${isLessonCompleted ? 'bg-emerald-500' : `bg-gradient-to-br ${catColors.gradient}`} flex items-center justify-center text-white font-bold text-sm shrink-0 mt-0.5`}>
                                  {isLessonCompleted ? (
                                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                                  ) : (
                                    index + 1
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-slate-900 group-hover:text-emerald-600">{lesson.title}</p>
                                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${type.color}`}>
                                      <span className="material-symbols-outlined text-xs">{type.icon}</span>
                                    </span>
                                    <span>{lesson.duration}</span>
                                  </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0 mt-0.5">arrow_forward</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
            <h3 className="text-lg font-bold text-slate-900 mb-2">Kategoriya qulflangan</h3>
            <p className="text-slate-600 text-sm mb-6">
              Bu kategoriyani ochish uchun avval <strong>"{pausedCategoryName}"</strong> kategoriyasini tugatishingiz kerak.
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
