import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ToifaTanlash() {
  const { user, logout } = useAuth();

  const toifalar = [
    { 
      id: 'shaxsiy', 
      title: 'Ota-ona shaxsiy rivojlanishi', 
      desc: "O'z ustingizda ishlash, stress boshqaruvi, oilaviy munosabatlar",
      icon: 'self_improvement',
      ageRange: "Barcha yoshlar uchun",
      color: 'from-emerald-500 to-emerald-600'
    },
    { 
      id: '6-9', 
      title: '6-9 yosh muammolari', 
      desc: "Maktabga moslashish, o'qishga qiziqish, do'stlar bilan munosabat",
      icon: 'child_care',
      ageRange: "6-9 yosh",
      color: 'from-teal-500 to-teal-600'
    },
    { 
      id: '10-12', 
      title: '10-12 yosh muammolari', 
      desc: "O'smirlik davri boshlanishi, mustaqillik, mas'uliyat",
      icon: 'school',
      ageRange: "10-12 yosh",
      color: 'from-green-500 to-green-600'
    },
    { 
      id: '13-15', 
      title: '13-15 yosh muammolari', 
      desc: "O'smirlik inqirozi, identifikatsiya, tengdoshlar ta'siri",
      icon: 'psychology',
      ageRange: "13-15 yosh",
      color: 'from-emerald-600 to-emerald-700'
    },
    { 
      id: '16-18', 
      title: '16-18 yosh muammolari', 
      desc: "Kelajak tanlovi, karyera, romantik munosabatlar",
      icon: 'person',
      ageRange: "16-18 yosh",
      color: 'from-teal-600 to-teal-700'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-display">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <span className="material-symbols-outlined text-xl sm:text-2xl lg:text-3xl">family_star</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-lg sm:text-xl font-bold text-slate-900">Mukammal Ota Ona</span>
                <p className="text-xs text-slate-500">Farzand tarbiyasi</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 lg:pl-4 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <p className="font-semibold text-slate-900 text-sm">{user?.fullName}</p>
                  <p className="text-xs text-slate-500">{user?.phone}</p>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  {user?.fullName?.charAt(0)}
                </div>
                <button onClick={logout} className="p-2 sm:p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Chiqish">
                  <span className="material-symbols-outlined text-xl">logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-12 mb-8 sm:mb-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative z-10">
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">Xush kelibsiz, {user?.fullName?.split(' ')[0]}! 👋</h1>
            <p className="text-emerald-100 text-sm sm:text-lg max-w-2xl">Farzandingiz yoshi yoki o'zingiz uchun kerakli toifani tanlang</p>
          </div>
        </div>

        {/* Toifalar Lenta */}
        <div className="flex flex-col gap-2">
          {toifalar.map((toifa) => (
            <Link
              key={toifa.id}
              to={`/bolim`}
              className="group flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 bg-white shadow-sm hover:shadow-md transition-all duration-300 border-y border-slate-100 hover:bg-emerald-50"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${toifa.color} flex items-center justify-center text-white shadow`}>
                <span className="material-symbols-outlined text-lg sm:text-xl">{toifa.icon}</span>
              </div>
              <span className="flex-1 font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors text-sm sm:text-base">{toifa.title}</span>
              <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">chevron_right</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
