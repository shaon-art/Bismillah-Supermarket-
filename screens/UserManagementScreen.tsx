import React, { useState, useMemo } from 'react';
import { User } from '../types';

interface UserManagementScreenProps {
  onBack: () => void;
  lang: 'bn' | 'en';
}

const UserManagementScreen: React.FC<UserManagementScreenProps> = ({ onBack, lang }) => {
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  
  // Load users from local storage
  const users: User[] = useMemo(() => {
    try {
      const stored = localStorage.getItem('users') || '[]';
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(search.toLowerCase()) || 
      u.phone.includes(search)
    ).sort((a, b) => {
        const timeA = a.id.startsWith('u-') ? parseInt(a.id.split('-')[1]) : 0;
        const timeB = b.id.startsWith('u-') ? parseInt(b.id.split('-')[1]) : 0;
        return timeB - timeA;
    });
  }, [users, search]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter(u => u.isAdmin).length,
      regular: users.filter(u => !u.isAdmin).length,
      joinedToday: users.filter(u => {
          const timestamp = u.id.startsWith('u-') ? parseInt(u.id.split('-')[1]) : 0;
          return (Date.now() - timestamp) < (24 * 60 * 60 * 1000);
      }).length
    };
  }, [users]);

  const handleUpdateUser = (updatedUser: User) => {
    const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const newUsers = allUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem('users', JSON.stringify(newUsers));
    // Soft refresh for demo purposes
    window.location.reload(); 
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত যে এই ইউজারটিকে চিরতরে মুছে ফেলতে চান?' : 'Are you sure you want to PERMANENTLY delete this user?')) {
      const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const updated = allUsers.filter(u => u.id !== id);
      localStorage.setItem('users', JSON.stringify(updated));
      window.location.reload();
    }
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser({ ...user });
    setShowPassword(false); // Reset visibility
    setShowEditModal(true);
  };

  const saveEditedUser = () => {
    if (editingUser) {
      handleUpdateUser(editingUser);
      setShowEditModal(false);
    }
  };

  const toggleAdminStatus = (user: User) => {
    const confirmMsg = user.isAdmin 
      ? (lang === 'bn' ? 'এই ইউজারের অ্যাডমিন ক্ষমতা কেড়ে নিতে চান?' : 'Remove admin privileges for this user?')
      : (lang === 'bn' ? 'এই ইউজারকে অ্যাডমিন বানাতে চান?' : 'Promote this user to Admin?');
    
    if (window.confirm(confirmMsg)) {
      handleUpdateUser({ ...user, isAdmin: !user.isAdmin });
    }
  };

  const generateRandomPassword = () => {
    if (!editingUser) return;
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
    let pass = "";
    for (let i = 0; i < 8; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEditingUser({ ...editingUser, password: pass });
    setShowPassword(true);
  };

  return (
    <div className="animate-fadeIn min-h-full bg-slate-50 dark:bg-slate-950 flex flex-col pb-20 transition-colors">
      <div className="bg-slate-900 px-5 py-6 sticky top-0 z-50 shadow-xl text-white">
        <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white active:scale-90 transition-transform">
                    ←
                </button>
                <div>
                    <h2 className="text-lg font-black tracking-tight">{lang === 'bn' ? 'ইউজার ডিরেক্টরি' : 'User Directory'}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{lang === 'bn' ? 'নিবন্ধিত সদস্যদের তালিকা' : 'Registered Members Database'}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-[18px] font-black text-green-400 leading-none">{stats.total}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{lang === 'bn' ? 'মোট সদস্য' : 'Total Users'}</p>
            </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <StatMiniCard label={lang === 'bn' ? 'আজকের জয়েন' : 'New Today'} value={stats.joinedToday} color="bg-green-500/10" textColor="text-green-400" />
          <StatMiniCard label={lang === 'bn' ? 'অ্যাডমিন' : 'Admins'} value={stats.admins} color="bg-orange-500/10" textColor="text-orange-400" />
          <StatMiniCard label={lang === 'bn' ? 'মেম্বার' : 'Regular'} value={stats.regular} color="bg-blue-500/10" textColor="text-blue-400" />
        </div>
      </div>

      <div className="p-4">
        <div className="relative mb-6">
          <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder={lang === 'bn' ? 'নাম বা ফোন নম্বর দিয়ে খুঁজুন...' : 'Search by name or phone...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
          />
        </div>

        <div className="space-y-4">
          {filteredUsers.map(user => (
            <div key={user.id} className="bg-white dark:bg-slate-900 p-5 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm transition-all group relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-inner shrink-0 relative overflow-hidden">
                  {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : '👤'}
                  {user.isAdmin && (
                    <div className="absolute top-0 right-0 w-4 h-4 bg-orange-500 border-2 border-white dark:border-slate-900 rounded-bl-lg"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[15px] font-black text-slate-800 dark:text-slate-100 truncate">{user.name}</h4>
                    {user.isAdmin && (
                      <span className="text-[8px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">Admin</span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">📞 {user.phone}</p>
                </div>

                <div className="flex gap-2">
                   <button 
                    onClick={() => handleOpenEdit(user)}
                    className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center active:scale-90 transition-transform"
                    title={lang === 'bn' ? 'এডিট করুন' : 'Edit User'}
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => toggleAdminStatus(user)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all ${
                      user.isAdmin ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'
                    }`}
                    title={lang === 'bn' ? 'অ্যাডমিন স্ট্যাটাস' : 'Toggle Admin'}
                  >
                    🛡️
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center active:scale-90 transition-transform"
                    title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete User'}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fadeIn bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative border border-white/10 overflow-y-auto max-h-[85vh] no-scrollbar">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6">
              {lang === 'bn' ? 'প্রোফাইল তথ্য পরিবর্তন' : 'Edit Member Profile'}
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{lang === 'bn' ? 'নাম' : 'Name'}</label>
                <input 
                  type="text" 
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{lang === 'bn' ? 'ফোন নম্বর' : 'Phone'}</label>
                <input 
                  type="tel" 
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              
              {/* Security Section */}
              <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    {lang === 'bn' ? 'নিরাপত্তা ও পাসওয়ার্ড' : 'Security & Password'}
                 </p>
                 <div className="space-y-1 relative">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{lang === 'bn' ? 'নতুন পাসওয়ার্ড সেট করুন' : 'Set New Password'}</label>
                    <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"}
                          value={editingUser.password || ''}
                          onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl pl-4 pr-10 py-3 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-red-500/20"
                          placeholder="••••••"
                        />
                        <button 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showPassword ? '🙈' : '👁️'}
                        </button>
                    </div>
                 </div>
                 <div className="flex justify-end mt-2">
                    <button 
                      onClick={generateRandomPassword}
                      className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      {lang === 'bn' ? 'র‍্যান্ডম পাসওয়ার্ড' : 'Generate Random'}
                    </button>
                 </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowEditModal(false)} className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 rounded-2xl">{lang === 'bn' ? 'বাতিল' : 'Cancel'}</button>
                <button onClick={saveEditedUser} className="flex-1 py-4 text-xs font-black text-white uppercase tracking-widest bg-blue-600 rounded-2xl shadow-lg shadow-blue-100 dark:shadow-none active:scale-95 transition-all">{lang === 'bn' ? 'সেভ করুন' : 'Save Info'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatMiniCard: React.FC<{ label: string; value: number; color: string; textColor?: string }> = ({ label, value, color, textColor = 'text-white' }) => (
  <div className={`${color} p-3 rounded-2xl border border-white/5 backdrop-blur-sm flex flex-col items-center justify-center`}>
    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">{label}</p>
    <p className={`text-sm font-black ${textColor}`}>{value}</p>
  </div>
);

export default UserManagementScreen;