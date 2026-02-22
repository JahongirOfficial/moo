import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { sectionsAPI, categoriesAPI, lessonsAPI } from '../../api';

export function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ sections: 0, categories: 0, lessons: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [secRes, catRes, lessonRes] = await Promise.all([
        sectionsAPI.getAll(),
        categoriesAPI.getAll(),
        lessonsAPI.getAll()
      ]);
      setStats({
        sections: secRes.data.length,
        categories: catRes.data.length,
        lessons: lessonRes.data.length
      });
    } catch (err) {
      console.error(err);
    }
  };

  const menuItems = [
    { 
      icon: 'folder', 
      label: "Bo'limlar", 
      desc: "Bo'limlarni qo'shish, tahrirlash va o'chirish", 
      path: '/admin/bolimlar', 
      count: stats.sections,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    { 
      icon: 'category', 
      label: 'Kategoriyalar', 
      desc: "Kategoriyalarni qo'shish, tahrirlash va o'chirish", 
      path: '/admin/kategoriyalar', 
      count: stats.categories,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    { 
      icon: 'school', 
      label: 'Darslar', 
      desc: "Darslarni qo'shish, tahrirlash va o'chirish", 
      path: '/admin/darslar', 
      count: stats.lessons,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-display">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white hidden lg:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
            </div>
            <div>
              <span className="font-bold">Admin Panel</span>
              <p className="text-xs text-slate-400">Mukammal Ota Ona</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 px-3">Boshqaruv</p>
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 text-white mb-2">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </Link>
          <Link to="/admin/bolimlar" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mb-2">
            <span className="material-symbols-outlined">folder</span>
            Bo'limlar
          </Link>
          <Link to="/admin/kategoriyalar" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mb-2">
            <span className="material-symbols-outlined">category</span>
            Kategoriyalar
          </Link>
          <Link to="/admin/darslar" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mb-2">
            <span className="material-symbols-outlined">school</span>
            Darslar
          </Link>
          <Link to="/admin/foydalanuvchilar" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mb-2">
            <span className="material-symbols-outlined">group</span>
            Foydalanuvchilar
          </Link>
          <Link to="/admin/sms" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mb-2">
            <span className="material-symbols-outlined">sms</span>
            SMS Xabarnoma
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link to="/bolim" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
            Saytga qaytish
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/bolim')} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl">
                  <span className="material-symbols-outlined">menu</span>
                </button>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
                  <p className="text-sm text-slate-500 hidden sm:block">Tizim statistikasi</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right">
                  <p className="font-semibold text-slate-900">{user?.fullName}</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                  {user?.fullName?.charAt(0)}
                </div>
                <button onClick={logout} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <span className="material-symbols-outlined">logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8">
          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">folder</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">{stats.sections}</p>
              <p className="text-slate-500">Bo'limlar</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">category</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">{stats.categories}</p>
              <p className="text-slate-500">Kategoriyalar</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">school</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">{stats.lessons}</p>
              <p className="text-slate-500">Darslar</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">group</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">-</p>
              <p className="text-slate-500">Foydalanuvchilar</p>
            </div>
          </div>

          {/* Quick Actions */}
          <h2 className="text-xl font-bold text-slate-900 mb-6">Tezkor amallar</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex items-center gap-6"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{item.label}</h3>
                  <p className="text-slate-500">{item.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-slate-900">{item.count}</p>
                  <p className="text-sm text-slate-500">ta</p>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}





