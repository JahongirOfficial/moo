import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? `http://${window.location.hostname}:3001/api`
  : `${window.location.protocol}//${window.location.hostname}/api`;

export function BoshSahifa() {
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    // Bo'limlarni yuklash
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const res = await fetch(`${API_URL}/sections/public`);
      if (res.ok) {
        const data = await res.json();
        setSections(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const features = [
    { icon: 'psychology', title: 'Ishlaydigan metodlar', desc: 'Doim tajribada o\'xshagan metodlarni beramiz', color: 'from-emerald-500 to-emerald-600' },
    { icon: 'play_circle', title: 'Video darslar', desc: 'Interaktiv video kurslar', color: 'from-emerald-500 to-emerald-600' },
    { icon: 'support_agent', title: '24/7 qo\'llab-quvvatlash', desc: 'Doimiy savollarga javoblar', color: 'from-emerald-500 to-emerald-600' },
    { icon: 'groups', title: 'Mukammal ota-onalar jamoasi', desc: 'Tajriba almashish', color: 'from-emerald-500 to-emerald-600' },
  ];

  const testimonials = [
    { name: 'Malika Karimova', role: "2 farzand onasi", text: "Bu platforma orqali farzandlarim bilan munosabatlarim tubdan o'zgardi. Har bir dars hayotiy va amaliy.", avatar: '/uploads/logo/gr.png' },
    { name: 'Azizbek Tursunov', role: "3 farzand otasi", text: "Video darslar juda tushunarli. Endi bolalarim bilan muloqot qilish osonlashdi.", avatar: '/uploads/logo/gr.png' },
    { name: 'Nilufar Rahimova', role: "1 farzand onasi", text: "Psixolog maslahatlari juda foydali. Bolam maktabga qiziqib boradi endi.", avatar: '/uploads/logo/gr.png' },
  ];



  return (
    <div className="min-h-screen bg-white font-display">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src="/uploads/logo/gr.png" alt="Logo" className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl object-cover" />
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-[0.3em] sm:tracking-[0.35em] lg:tracking-[0.4em] ml-[2px]">mukammal</span>
                <span className="text-base sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent -mt-1">OTA-ONA</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#categories" className="text-slate-600 hover:text-primary transition-colors font-medium">Kategoriyalar</a>
              <a href="#testimonials" className="text-slate-600 hover:text-primary transition-colors font-medium">Fikrlar</a>
              <Link to="/kirish" className="text-slate-700 hover:text-primary font-medium transition-colors">
                Kirish
              </Link>
              <Link to="/kirish?tab=register" className="px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all text-sm sm:text-base">
                Boshlash
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 lg:pt-24 pb-10 lg:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-6">
                <span className="material-symbols-outlined text-lg">verified</span>
                #1-raqamli tarbiyaviy platforma
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 mb-4 sm:mb-6" style={{ lineHeight: '1.3' }}>
                Birgalikda farzandingizni
                <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent"> DUNYO</span>ga
                <br />
                olib chiqamiz
              </h1>
              <p className="text-sm sm:text-lg lg:text-xl text-slate-600 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
                Buyuk bolalar ortidagi buyuk OTA-ONA bo'ling!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link to="/kirish?tab=register" className="group px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2">
                  Darslarni boshlash
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-lg sm:text-2xl">arrow_forward</span>
                </Link>
                <a href="#features" className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-slate-700 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg border-2 border-slate-200 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg sm:text-2xl">play_circle</span>
                  Loyiha haqida video
                </a>
              </div>
              

            </div>
            
            <div className="relative hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=550&h=500&fit=crop" 
                alt="Ona va bola" 
                className="rounded-3xl shadow-2xl shadow-slate-900/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-6 sm:py-10 lg:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider">Kategoriyalar</span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mt-2 mb-3 sm:mb-4">Yosh Kategoriyalari</h2>
            <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto">Farzandingiz yoshiga mos darslarni tanlang</p>
          </div>
          
          <div className={`grid gap-3 sm:gap-6 lg:gap-8 ${sections.length === 5 ? 'grid-cols-2 lg:grid-cols-6' : 'grid-cols-2 lg:grid-cols-3'}`}>
            {sections.length > 0 ? sections.map((section, i) => {
              // 5 ta bo'lganda: birinchi 3 tasi 2 col, oxirgi 2 tasi 3 col
              const colSpan = sections.length === 5 
                ? (i < 3 ? 'lg:col-span-2' : 'lg:col-span-3') 
                : '';
              
              return (
                <div 
                  key={section.id || i} 
                  className={`group relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 overflow-hidden ${colSpan}`}
                >
                  <div className={`absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-emerald-500 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`}></div>
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${section.color || 'from-emerald-500 to-emerald-600'} flex items-center justify-center text-white mb-3 sm:mb-5 shadow-lg`}>
                    <span className="material-symbols-outlined text-lg sm:text-2xl">{section.icon || 'folder'}</span>
                  </div>
                  <h3 className="text-sm sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2">{section.name}</h3>
                  <p className="text-slate-600 mb-2 sm:mb-4 text-xs sm:text-base line-clamp-2">{section.categoryCount || 0} ta kategoriya</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-slate-500">{section.categoryCount || 0} ta kategoriya</span>
                    <span className="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform text-lg sm:text-2xl">arrow_forward</span>
                  </div>
                </div>
              );
            }) : (
              // Skeleton loader
              [...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm border border-slate-100 animate-pulse">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-200 mb-3 sm:mb-5"></div>
                  <div className="h-4 sm:h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 sm:h-4 bg-slate-100 rounded w-1/2"></div>
                </div>
              ))
            )}
          </div>
          
          <div className="text-center mt-8 sm:mt-12">
            <Link to="/kirish?tab=register" className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-bold hover:bg-slate-800 transition-colors text-sm sm:text-base">
              Barcha kategoriyalar
              <span className="material-symbols-outlined text-lg sm:text-2xl">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-6 sm:py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider">Imkoniyatlar</span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mt-2 mb-3 sm:mb-4">Nima uchun bizni tanlashadi?</h2>
            <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto">Platformamiz sizga eng yaxshi tajriba va bilimlarni taqdim etadi</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {features.map((f, i) => (
              <div key={i} className="group bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-3 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <span className="material-symbols-outlined text-xl sm:text-3xl">{f.icon}</span>
                </div>
                <h3 className="text-sm sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2">{f.title}</h3>
                <p className="text-slate-600 text-xs sm:text-base">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-6 sm:py-10 lg:py-16 bg-gradient-to-br from-emerald-500 to-emerald-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-emerald-200 font-semibold text-xs sm:text-sm uppercase tracking-wider">Fikrlar</span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white mt-2 mb-3 sm:mb-4">Foydalanuvchilar nima deydi?</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/20">
                <div className="flex items-center gap-0.5 text-yellow-400 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="material-symbols-outlined text-base sm:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p className="text-white/90 text-sm sm:text-lg mb-4 sm:mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3 sm:gap-4">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-bold text-white text-sm sm:text-base">{t.name}</p>
                    <p className="text-emerald-200 text-xs sm:text-sm">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-6 sm:py-10 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-slate-900 mb-4 sm:mb-6">Bugun boshlang!</h2>
          <p className="text-sm sm:text-xl text-slate-600 mb-6 sm:mb-10">Minglab ota-onalar allaqachon farzandlari bilan munosabatlarini yaxshilashdi.</p>
          <Link to="/kirish?tab=register" className="inline-flex items-center gap-2 sm:gap-3 px-6 py-3 sm:px-10 sm:py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-xl hover:shadow-2xl hover:shadow-primary/30 transition-all">
            Bepul ro'yxatdan o'tish
            <span className="material-symbols-outlined text-lg sm:text-2xl">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <img src="/uploads/logo/gr.png" alt="Logo" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-[0.3em] sm:tracking-[0.35em] ml-[2px]">mukammal</span>
                  <span className="text-lg sm:text-xl font-bold -mt-1">OTA-ONA</span>
                </div>
              </div>
              <p className="text-slate-400 max-w-md text-sm sm:text-base">Zamonaviy ilm va milliy qadriyatlar asosida farzand tarbiyasi platformasi.</p>
            </div>
            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Sahifalar</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Bosh sahifa</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kategoriyalar</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Narxlar</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Bog'lanish</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>+998 88 081 81 88</li>
                <li>Toshkent</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 sm:pt-8 text-center text-slate-500 text-xs sm:text-sm">
            <p>© 2026 Mukammal Ota Ona</p>
          </div>
          
          {/* SEO - Kirill alifbosi uchun yashirin matn (Google indekslashi uchun) */}
          <div className="sr-only" aria-hidden="true">
            <h2>Мукаммал Ота Она - Фарзанд тарбияси платформаси</h2>
            <p>Буюк болалар ортидаги буюк ОТА-ОНА бўлинг! 150+ видео дарслар, профессионал психологлар маслаҳати ва 24/7 қўллаб-қувватлаш. Ўзбекистондаги #1 тарбиявий платформа.</p>
            <p>Бола тарбияси, ота она маслаҳатлари, болалар психологияси, оилавий муносабатлар, ўсмир тарбияси, фарзанд тарбияси сирлари.</p>
            <p>6-18 ёш учун умумий муаммолар, 6-9 ёш муаммолари, 10-12 ёш муаммолари, 13-15 ёш муаммолари, 16-18 ёш муаммолари.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}




