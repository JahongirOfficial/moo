import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sectionsAPI } from '../../api';

interface Section {
  id: string;
  name: string;
  icon: string;
  color: string;
  orderIndex: number;
  status: 'active' | 'pause';
  categoryCount: number;
}

const icons = ['self_improvement', 'child_care', 'school', 'psychology', 'person', 'family_restroom', 'groups', 'favorite'];
const colors = [
  'from-emerald-500 to-emerald-600',
  'from-teal-500 to-teal-600',
  'from-green-500 to-green-600',
  'from-emerald-600 to-emerald-700',
  'from-teal-600 to-teal-700',
];

export function AdminBolimlar() {
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', icon: 'folder', color: 'from-emerald-500 to-emerald-600', orderIndex: 0, status: 'active' as 'active' | 'pause' });
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; section: Section | null }>({ show: false, section: null });
  const [deleting, setDeleting] = useState(false);

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

  const openModal = (section?: Section) => {
    if (section) {
      setEditingId(section.id);
      setForm({ name: section.name, icon: section.icon, color: section.color, orderIndex: section.orderIndex || 0, status: section.status || 'active' });
    } else {
      setEditingId(null);
      setForm({ name: '', icon: 'folder', color: 'from-emerald-500 to-emerald-600', orderIndex: sections.length, status: 'active' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await sectionsAPI.update(editingId, form);
      } else {
        await sectionsAPI.create(form);
      }
      setShowModal(false);
      loadSections();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, keepCategories: boolean) => {
    setDeleting(true);
    try {
      await sectionsAPI.delete(id, keepCategories);
      setDeleteModal({ show: false, section: null });
      loadSections();
    } catch (err: any) {
      alert(err.response?.data?.error || "Xatolik yuz berdi");
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (section: Section) => {
    setDeleteModal({ show: true, section });
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
          <Link to="/admin/bolimlar" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 text-white mb-2">
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
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin')} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Bo'limlar</h1>
                  <p className="text-sm text-slate-500">{sections.length} ta bo'lim</p>
                </div>
              </div>
              <button onClick={() => openModal()} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                <span className="material-symbols-outlined">add</span>
                <span className="hidden sm:inline">Qo'shish</span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
          ) : sections.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl text-slate-400">folder</span>
              </div>
              <p className="text-xl text-slate-500 mb-6">Hali bo'lim yo'q</p>
              <button onClick={() => openModal()} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold">
                Birinchi bo'limni qo'shing
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-center px-4 py-4 font-semibold text-slate-600 w-16">№</th>
                      <th className="text-left px-6 py-4 font-semibold text-slate-600">Bo'lim</th>
                      <th className="text-center px-6 py-4 font-semibold text-slate-600">Holat</th>
                      <th className="text-center px-6 py-4 font-semibold text-slate-600">Kategoriyalar</th>
                      <th className="text-right px-6 py-4 font-semibold text-slate-600">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sections.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)).map((section) => (
                      <tr key={section.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold text-sm">{section.orderIndex || 0}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center text-white shadow-lg`}>
                              <span className="material-symbols-outlined text-xl">{section.icon}</span>
                            </div>
                            <span className="font-semibold text-slate-900">{section.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${section.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            <span className="material-symbols-outlined text-sm">{section.status === 'active' ? 'check_circle' : 'pause_circle'}</span>
                            {section.status === 'active' ? 'Faol' : 'Pauza'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-semibold text-slate-700">{section.categoryCount} ta</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openModal(section)} className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all">
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button onClick={() => openDeleteModal(section)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
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
            
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">{editingId ? "Bo'limni tahrirlash" : "Yangi bo'lim"}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nomi</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-lg focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm"
                  placeholder="Bo'lim nomi"
                  required
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
                      className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white transition-all ${
                        form.color === color ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : ''
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
                    className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-lg focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm"
                    placeholder="0"
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
                    <option value="active">Faol</option>
                    <option value="pause">Pauza</option>
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

      {/* Delete Modal */}
      {deleteModal.show && deleteModal.section && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeleteModal({ show: false, section: null })} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-red-600">delete</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Bo'limni o'chirish</h3>
              <p className="text-slate-600 text-sm">
                <strong>"{deleteModal.section.name}"</strong> bo'limini o'chirmoqchimisiz?
              </p>
              {deleteModal.section.categoryCount > 0 && (
                <p className="text-amber-600 text-sm mt-2">
                  Bu bo'limda <strong>{deleteModal.section.categoryCount} ta</strong> kategoriya bor.
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              {deleteModal.section.categoryCount > 0 && (
                <button
                  onClick={() => handleDelete(deleteModal.section!.id, true)}
                  disabled={deleting}
                  className="w-full py-3 bg-amber-100 text-amber-700 rounded-xl font-semibold hover:bg-amber-200 transition-colors text-sm disabled:opacity-50"
                >
                  {deleting ? 'O\'chirilmoqda...' : 'Kategoriyalarni saqlab qolish'}
                </button>
              )}
              <button
                onClick={() => handleDelete(deleteModal.section!.id, false)}
                disabled={deleting}
                className="w-full py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
              >
                {deleting ? 'O\'chirilmoqda...' : deleteModal.section.categoryCount > 0 ? 'Hammasi bilan o\'chirish' : 'O\'chirish'}
              </button>
              <button
                onClick={() => setDeleteModal({ show: false, section: null })}
                disabled={deleting}
                className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors text-sm"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

