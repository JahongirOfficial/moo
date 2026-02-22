import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { categoriesAPI, lessonsAPI, uploadAPI } from '../../api';

interface Category { id: string; name: string; }
interface Lesson {
  id: string; title: string; content: string; duration: string;
  type: string; categoryId: string; categoryName?: string; sectionName?: string; orderIndex: number; videoUrl?: string;
  savollar?: string; xulosa?: string;
}

export function AdminDarslar() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId || '');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ categoryId: '', title: '', content: '', duration: '5 daqiqa', type: 'article', videoUrl: '', savollar: '', xulosa: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { loadLessons(); }, [selectedCategory]);

  const loadData = async () => {
    try { const res = await categoriesAPI.getAll(); setCategories(res.data); }
    catch (err) { console.error(err); }
  };

  const loadLessons = async () => {
    setLoading(true);
    try { const res = await lessonsAPI.getAll(selectedCategory || undefined); setLessons(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openModal = (lesson?: Lesson) => {
    if (lesson) {
      setEditingId(lesson.id);
      setForm({ categoryId: lesson.categoryId, title: lesson.title, content: lesson.content || '', duration: lesson.duration, type: lesson.type, videoUrl: lesson.videoUrl || '', savollar: lesson.savollar || '', xulosa: lesson.xulosa || '' });
    } else {
      setEditingId(null);
      setForm({ categoryId: selectedCategory || categories[0]?.id || '', title: '', content: '', duration: '5 daqiqa', type: 'article', videoUrl: '', savollar: '', xulosa: '' });
    }
    setShowModal(true);
  };


  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const res = await uploadAPI.uploadVideo(file);
      setForm({ ...form, videoUrl: res.data.videoUrl });
      setUploadProgress(100);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Video yuklashda xatolik');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) await lessonsAPI.update(editingId, form);
      else await lessonsAPI.create({ ...form, categoryId: form.categoryId });
      setShowModal(false);
      loadLessons();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Darsni o'chirishni tasdiqlaysizmi?")) return;
    try { await lessonsAPI.delete(id); loadLessons(); }
    catch (err) { console.error(err); }
  };

  const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
    article: { icon: 'article', label: 'Maqola', color: 'bg-emerald-100 text-emerald-600' },
    video: { icon: 'play_circle', label: 'Video', color: 'bg-emerald-100 text-emerald-600' },
    audio: { icon: 'headphones', label: 'Audio', color: 'bg-orange-100 text-orange-600' },
  };

  return (
    <div className="min-h-screen bg-slate-100 font-display">
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white hidden lg:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
            </div>
            <div><span className="font-bold">Admin Panel</span><p className="text-xs text-slate-400">Mukammal Ota Ona</p></div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 px-3">Boshqaruv</p>
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mb-2"><span className="material-symbols-outlined">dashboard</span>Dashboard</Link>
          <Link to="/admin/bolimlar" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mb-2"><span className="material-symbols-outlined">folder</span>Bo'limlar</Link>
          <Link to="/admin/kategoriyalar" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mb-2"><span className="material-symbols-outlined">category</span>Kategoriyalar</Link>
          <Link to="/admin/darslar" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 text-white mb-2"><span className="material-symbols-outlined">school</span>Darslar</Link>
          <Link to="/admin/foydalanuvchilar" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mb-2"><span className="material-symbols-outlined">group</span>Foydalanuvchilar</Link>
          <Link to="/admin/sms" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mb-2"><span className="material-symbols-outlined">sms</span>SMS Xabarnoma</Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link to="/bolim" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"><span className="material-symbols-outlined">arrow_back</span>Saytga qaytish</Link>
        </div>
      </aside>


      <div className="lg:ml-64">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin')} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl"><span className="material-symbols-outlined">arrow_back</span></button>
                <div><h1 className="text-lg sm:text-xl font-bold text-slate-900">Darslar</h1><p className="text-xs sm:text-sm text-slate-500">{lessons.length} ta dars</p></div>
              </div>
              <button onClick={() => openModal()} className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm sm:text-base">
                <span className="material-symbols-outlined">add</span><span className="hidden sm:inline">Qo'shish</span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Kategoriya</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full max-w-xs px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-primary outline-none text-sm sm:text-base">
              <option value="">Barcha kategoriyalar</option>
              {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">school</span>
              <p className="text-lg text-slate-500 mb-6">Hali dars yo'q</p>
              <button onClick={() => openModal()} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold text-sm">Birinchi darsni qo'shing</button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 sm:px-6 py-4 font-semibold text-slate-600 text-sm">Dars</th>
                    <th className="text-left px-4 sm:px-6 py-4 font-semibold text-slate-600 text-sm hidden lg:table-cell">Bo'lim</th>
                    <th className="text-left px-4 sm:px-6 py-4 font-semibold text-slate-600 text-sm hidden md:table-cell">Kategoriya</th>
                    <th className="text-center px-4 sm:px-6 py-4 font-semibold text-slate-600 text-sm hidden sm:table-cell">Turi</th>
                    <th className="text-right px-4 sm:px-6 py-4 font-semibold text-slate-600 text-sm">Amallar</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {lessons.map((lesson) => {
                      const type = typeConfig[lesson.type] || typeConfig.article;
                      return (
                        <tr key={lesson.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 sm:px-6 py-4"><span className="font-semibold text-slate-900 text-sm">{lesson.title}</span></td>
                          <td className="px-4 sm:px-6 py-4 text-slate-500 text-sm hidden lg:table-cell">{lesson.sectionName || '-'}</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-500 text-sm hidden md:table-cell">{lesson.categoryName || categories.find(c => c.id === lesson.categoryId)?.name}</td>
                          <td className="px-4 sm:px-6 py-4 text-center hidden sm:table-cell">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${type.color} font-medium text-xs`}>
                              <span className="material-symbols-outlined text-sm">{type.icon}</span>{type.label}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openModal(lesson)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl"><span className="material-symbols-outlined text-xl">edit</span></button>
                              <button onClick={() => handleDelete(lesson.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"><span className="material-symbols-outlined text-xl">delete</span></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>


      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"><span className="material-symbols-outlined">close</span></button>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">{editingId ? 'Darsni tahrirlash' : 'Yangi dars'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Kategoriya</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary outline-none text-sm" required>
                    <option value="">Tanlang</option>
                    {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Turi</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary outline-none text-sm">
                    <option value="article">Maqola</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Dars nomi</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary outline-none text-sm" placeholder="Dars nomi" required />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Davomiyligi</label>
                <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary outline-none text-sm" placeholder="5 daqiqa" />
              </div>

              {form.type === 'video' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Video fayl</label>
                  <input type="file" ref={fileInputRef} accept="video/*" onChange={handleVideoUpload} className="hidden" />
                  
                  {form.videoUrl ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-emerald-600 text-2xl">check_circle</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-emerald-700 text-sm">Video yuklandi</p>
                          <p className="text-xs text-emerald-600 truncate">{form.videoUrl}</p>
                        </div>
                        <button type="button" onClick={() => setForm({ ...form, videoUrl: '' })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50">
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                          <p className="text-sm text-slate-500">Yuklanmoqda... {uploadProgress}%</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <span className="material-symbols-outlined text-4xl text-slate-400">cloud_upload</span>
                          <p className="text-sm text-slate-500">Video yuklash uchun bosing</p>
                          <p className="text-xs text-slate-400">MP4, WebM, OGG (max 500MB)</p>
                        </div>
                      )}
                    </button>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Savollar</label>
                <textarea value={form.savollar} onChange={(e) => setForm({ ...form, savollar: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary outline-none text-sm resize-none" placeholder="Savollar..." rows={4} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Xulosa</label>
                <textarea value={form.xulosa} onChange={(e) => setForm({ ...form, xulosa: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary outline-none text-sm resize-none" placeholder="Xulosa..." rows={4} />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 text-sm">Bekor qilish</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 text-sm">{saving ? 'Saqlanmoqda...' : 'Saqlash'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}




