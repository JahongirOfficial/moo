import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usersAPI } from '../../api';

interface User {
  id: string;
  fullName: string;
  phone: string;
  isSubscribed: boolean;
  subscriptionEndDate: string | null;
  subscriptionActive: boolean;
  createdAt: string;
}

export function AdminFoydalanuvchilar() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [days, setDays] = useState(30);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const res = await usersAPI.getAll();
      setUsers(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  );

  const openSubscriptionModal = (user: User) => {
    setSelectedUser(user);
    setDays(30);
    setShowModal(true);
  };

  const handleSubscription = async (activate: boolean) => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await usersAPI.updateSubscription(selectedUser.id, { isSubscribed: activate, days: activate ? days : 0 });
      setShowModal(false);
      loadUsers();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };


  const handleDelete = async (id: string) => {
    if (!confirm("Foydalanuvchini o'chirishni tasdiqlaysizmi?")) return;
    try {
      await usersAPI.delete(id);
      loadUsers();
    } catch (err) { console.error(err); }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' });
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
          <Link to="/admin/kategoriyalar" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mb-2">
            <span className="material-symbols-outlined">category</span>
            Kategoriyalar
          </Link>
          <Link to="/admin/darslar" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mb-2">
            <span className="material-symbols-outlined">school</span>
            Darslar
          </Link>
          <Link to="/admin/foydalanuvchilar" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 text-white mb-2">
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
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin')} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">Foydalanuvchilar</h1>
                  <p className="text-xs sm:text-sm text-slate-500">{users.length} ta foydalanuvchi</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-xl">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-primary outline-none transition-all text-sm sm:text-base"
                placeholder="Qidirish..."
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">group</span>
              <p className="text-lg text-slate-500">Foydalanuvchi topilmadi</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 sm:px-6 py-4 font-semibold text-slate-600 text-sm">Foydalanuvchi</th>
                      <th className="text-left px-4 sm:px-6 py-4 font-semibold text-slate-600 text-sm hidden md:table-cell">Telefon</th>
                      <th className="text-center px-4 sm:px-6 py-4 font-semibold text-slate-600 text-sm">Obuna</th>
                      <th className="text-center px-4 sm:px-6 py-4 font-semibold text-slate-600 text-sm hidden sm:table-cell">Tugash</th>
                      <th className="text-right px-4 sm:px-6 py-4 font-semibold text-slate-600 text-sm">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {user.fullName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 text-sm truncate">{user.fullName}</p>
                              <p className="text-xs text-slate-500 md:hidden">{user.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-slate-600 text-sm hidden md:table-cell">{user.phone}</td>
                        <td className="px-4 sm:px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${user.subscriptionActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{user.subscriptionActive ? 'check_circle' : 'cancel'}</span>
                            <span className="hidden sm:inline">{user.subscriptionActive ? 'Faol' : 'Noafaol'}</span>
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-center text-slate-500 text-sm hidden sm:table-cell">{formatDate(user.subscriptionEndDate)}</td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <button onClick={() => openSubscriptionModal(user)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="Obuna">
                              <span className="material-symbols-outlined text-xl">card_membership</span>
                            </button>
                            <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="O'chirish">
                              <span className="material-symbols-outlined text-xl">delete</span>
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


      {/* Subscription Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Obunani boshqarish</h2>
            <p className="text-slate-500 mb-6 text-sm">{selectedUser.fullName}</p>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${selectedUser.subscriptionActive ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-2xl ${selectedUser.subscriptionActive ? 'text-emerald-600' : 'text-red-600'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {selectedUser.subscriptionActive ? 'check_circle' : 'cancel'}
                  </span>
                  <div>
                    <p className={`font-semibold ${selectedUser.subscriptionActive ? 'text-emerald-700' : 'text-red-700'}`}>
                      {selectedUser.subscriptionActive ? 'Obuna faol' : 'Obuna noafaol'}
                    </p>
                    {selectedUser.subscriptionEndDate && (
                      <p className="text-xs text-slate-500">Tugash: {formatDate(selectedUser.subscriptionEndDate)}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Necha kun?</label>
                <input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  min={1}
                  max={365}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary outline-none"
                  placeholder="Kunlar soni"
                />
                <div className="flex gap-2 mt-2">
                  {[30, 45, 60, 90, 180, 365].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDays(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${days === d ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {d} kun
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {selectedUser.subscriptionActive ? (
                  <button
                    onClick={() => handleSubscription(false)}
                    disabled={saving}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Kutib turing...' : 'Obunani bekor qilish'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscription(true)}
                    disabled={saving}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {saving ? 'Kutib turing...' : 'Obunani faollashtirish'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




