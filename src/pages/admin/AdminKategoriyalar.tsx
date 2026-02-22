import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categoriesAPI, sectionsAPI } from '../../api';

interface Category {
  id: string;
  sectionId?: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  orderIndex: number;
  status: 'active' | 'pause';
  lessonCount: number;
}

interface Section {
  id: string;
  name: string;
}

const icons = ['psychology', 'school', 'favorite', 'forum', 'fact_check', 'fitness_center', 'family_restroom', 'child_care', 'emoji_emotions', 'health_and_safety'];
const colors = ['green', 'teal', 'red', 'purple', 'orange', 'blue'];

export function AdminKategoriyalar() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ sectionId: '', name: '', description: '', icon: 'category', color: 'green', orderIndex: 0, status: 'active' as 'active' | 'pause' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [catRes, secRes] = await Promise.all([
        categoriesAPI.getAll(),
        sectionsAPI.getAll()
      ]);
      setCategories(catRes.data);
      setSections(secRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingId(category.id);
      setForm({ sectionId: category.sectionId || '', name: category.name, description: category.description, icon: category.icon, color: category.color, orderIndex: category.orderIndex || 0, status: category.status || 'active' });
    } else {
      setEditingId(null);
      setForm({ sectionId: sections[0]?.id || '', name: '', description: '', icon: 'category', color: 'green', orderIndex: 0, status: 'active' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await categoriesAPI.update(editingId, form);
      } else {
        await categoriesAPI.create(form);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Kategoriyani o'chirishni tasdiqlaysizmi? Barcha darslar ham o'chiriladi!")) return;
    try {
      await categoriesAPI.delete(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const colorClasses: Record<string, { bg: string; gradient: string }> = {
    green: { bg: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600' },
    blue: { bg: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600' },
    red: { bg: 'bg-red-500', gradient: 'from-red-500 to-red-600' },
    purple: { bg: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600' },
    orange: { bg: 'bg-orange-500', gradient: 'from-orange-500 to-orange-600' },
    teal: { bg: 'bg-teal-500', gradient: 'from-teal-500 to-teal-600' },
  };

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
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mb-2">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </Link>
          <Link to="/admin/bolimlar" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mb-2">
            <span className="material-symbols-outlined">folder</span>
            Bo'limlar
          </Link>
          <Link to="/admin/kategoriyalar" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 text-white mb-2">
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
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin')} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Kategoriyalar</h1>
                  <p className="text-sm text-slate-500">{categories.length} ta kategoriya</p>
                </div>
              </div>
              <button onClick={() => openModal()} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all">
                <span className="material-symbols-outlined">add</span>
                <span className="hidden sm:inline">Qo'shish</span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl text-slate-400">category</span>
              </div>
              <p className="text-xl text-slate-500 mb-6">Hali kategoriya yo'q</p>
              <button onClick={() => openModal()} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold">
                Birinchi kategoriyani qo'shing
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-6 py-4 font-semibold text-slate-600">Kategoriya</th>
                      <th className="text-left px-6 py-4 font-semibold text-slate-600 hidden md:table-cell">Tavsif</th>
                      <th className="text-center px-6 py-4 font-semibold text-slate-600">Tartib</th>
                      <th className="text-center px-6 py-4 font-semibold text-slate-600">Holat</th>
                      <th className="text-center px-6 py-4 font-semibold text-slate-600">Darslar</th>
                      <th className="text-right px-6 py-4 font-semibold text-slate-600">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[cat.color]?.gradient || 'from-emerald-500 to-emerald-600'} flex items-center justify-center text-white shadow-lg`}>
                              <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                            </div>
                            <span className="font-semibold text-slate-900">{cat.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 hidden md:table-cell max-w-xs truncate">{cat.description}</td>
                        <td className="px-6 py-4 text-center font-semibold text-slate-600">{cat.orderIndex || 0}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${cat.status === 'pause' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {cat.status === 'pause' ? 'Pause' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link to={`/admin/darslar/${cat.id}`} className="inline-flex items-center gap-1 text-primary hover:underline font-semibold">
                            {cat.lessonCount} ta
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openModal(cat)} className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button onClick={() => handleDelete(cat.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">{editingId ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bo'lim</label>
                <select
                  value={form.sectionId}
                  onChange={(e) => setForm({ ...form, sectionId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-lg focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm"
                  required
                >
                  <option value="">Bo'lim tanlang</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>{sec.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nomi</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-lg focus:bg-white focus:border-primary outline-none transition-all text-sm"
                  placeholder="Kategoriya nomi"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tavsif</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-lg focus:bg-white focus:border-primary outline-none transition-all text-sm resize-none"
                  placeholder="Qisqacha tavsif"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Ikonka</label>
                <div className="flex flex-wrap gap-1.5">
                  {icons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm({ ...form, icon })}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                        form.icon === icon 
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg scale-110' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Rang</label>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      className={`w-9 h-9 rounded-lg bg-gradient-to-br ${colorClasses[color]?.gradient} flex items-center justify-center text-white transition-all ${
                        form.color === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                      }`}
                    >
                      {form.color === color && <span className="material-symbols-outlined text-sm">check</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tartib raqami</label>
                  <input
                    type="number"
                    value={form.orderIndex}
                    onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-lg focus:bg-white focus:border-primary outline-none transition-all text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Holat</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'pause' })}
                    className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-lg focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="pause">Pause</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors text-sm">
                  Bekor qilish
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 text-sm">
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}





