import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usersAPI } from '../../api';

interface User {
  id: string;
  fullName: string;
  phone: string;
  isSubscribed: boolean;
  subscriptionActive: boolean;
}

export function AdminSMS() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const res = await usersAPI.getAll();
      setUsers(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search);
    if (filter === 'active') return matchesSearch && u.subscriptionActive;
    if (filter === 'inactive') return matchesSearch && !u.subscriptionActive;
    return matchesSearch;
  });

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const toggleUser = (id: string) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(uid => uid !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const getSelectedPhones = () => {
    return users
      .filter(u => selectedUsers.includes(u.id))
      .map(u => u.phone.replace(/\s/g, ''))
      .join(',');
  };

  const handleSendSMS = () => {
    if (!message.trim()) {
      alert("Xabar matnini kiriting!");
      return;
    }
    if (selectedUsers.length === 0) {
      alert("Kamida bitta foydalanuvchi tanlang!");
      return;
    }

    const phones = getSelectedPhones();
    const encodedMessage = encodeURIComponent(message);
    
    // SMS ilovasiga o'tkazish
    window.location.href = `sms:${phones}?body=${encodedMessage}`;
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
          <Link to="/admin/foydalanuvchilar" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mb-2">
            <span className="material-symbols-outlined">group</span>
            Foydalanuvchilar
          </Link>
          <Link to="/admin/sms" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 text-white mb-2">
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
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">SMS Xabarnoma</h1>
                  <p className="text-xs sm:text-sm text-slate-500">{selectedUsers.length} ta tanlangan</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {/* SMS Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit_note</span>
              Xabar yozish
            </h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary outline-none transition-all resize-none text-sm sm:text-base"
              placeholder="SMS xabarini yozing..."
            />
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-500">{message.length} belgi</p>
              <button
                onClick={handleSendSMS}
                disabled={!message.trim() || selectedUsers.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">send</span>
                SMS yuborish ({selectedUsers.length})
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-xl">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-primary outline-none transition-all text-sm sm:text-base"
                placeholder="Qidirish..."
              />
            </div>
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'Barchasi' },
                { key: 'active', label: 'Faol' },
                { key: 'inactive', label: 'Noafaol' }
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key as any)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.key ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Users List */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Select All Header */}
              <div className="px-4 sm:px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-700 text-sm">Barchasini tanlash</span>
                </label>
                <span className="text-sm text-slate-500">{filteredUsers.length} ta foydalanuvchi</span>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">group</span>
                  <p className="text-slate-500">Foydalanuvchi topilmadi</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <label
                      key={user.id}
                      className={`flex items-center gap-4 px-4 sm:px-6 py-4 cursor-pointer transition-colors ${selectedUsers.includes(user.id) ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUser(user.id)}
                        className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                      />
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {user.fullName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{user.fullName}</p>
                        <p className="text-xs text-slate-500">{user.phone}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${user.subscriptionActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {user.subscriptionActive ? 'Faol' : 'Noafaol'}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
