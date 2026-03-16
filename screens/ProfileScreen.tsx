import React, { useState, useRef } from 'react';
import { TRANSLATIONS } from '../constants';
import { Screen, User, Order, SystemSettings } from '../types';
import { uploadToImgBB } from '../utils/imgbb';

interface ProfileScreenProps {
  currentUser: User;
  isAdmin: boolean;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  onNavigate: (screen: Screen) => void;
  onShowLegal: (type: 'PRIVACY' | 'TERMS') => void;
  lang: 'bn' | 'en';
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  currentUser,
  isAdmin, 
  onLogout, 
  onUpdateUser,
  onNavigate, 
  onShowLegal,
  lang
}) => {
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[lang] as any;

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  
  const [editUserData, setEditUserData] = useState<Partial<User>>({
    name: currentUser.name,
    phone: currentUser.phone,
    avatar: currentUser.avatar,
    password: currentUser.password
  });

  const handleProfileSave = () => {
    if (!editUserData.name?.trim() || !editUserData.phone?.trim()) return;
    onUpdateUser({ ...currentUser, ...editUserData } as User);
    setShowEditProfileModal(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setError('');
      try {
        const imageUrl = await uploadToImgBB(file);
        setEditUserData(prev => ({ ...prev, avatar: imageUrl }));
      } catch (err) {
        console.error("Avatar upload failed:", err);
        setError(lang === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Avatar upload failed');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDeveloperClick = () => {
    window.open('https://www.facebook.com/tamimhasanshaon2', '_blank');
  };

  return (
    <div className="p-4 space-y-6 animate-fadeIn pb-10">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center text-center group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <div className="relative mb-6">
          <div className="w-28 h-28 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-5xl border-4 border-white dark:border-slate-800 shadow-xl relative overflow-hidden group/avatar">
            {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : currentUser.name.charAt(0)}
          </div>
          <button 
            onClick={() => setShowEditProfileModal(true)}
            className="absolute bottom-0 right-0 w-10 h-10 bg-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-900 active:scale-90 transition-transform"
          >
            ✏️
          </button>
        </div>

        <div className="w-full space-y-1">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
            {currentUser.name}
          </h2>
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 tracking-wider">
            {currentUser.phone}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
             <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100 dark:border-green-900/30">
               {currentUser.isAdmin ? '👑 Store Owner' : '🛒 Verified Member'}
             </span>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-slate-900 rounded-[40px] p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div>
              <h3 className="text-white text-base font-black tracking-tight">{lang === 'bn' ? 'অ্যাডমিন সেন্টার' : 'Admin Control Panel'}</h3>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Global Store Management</p>
            </div>
          </div>

          <button 
            onClick={() => onNavigate('ADMIN_CONTROL')}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-[30px] font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4 group"
          >
            <span className="text-2xl group-hover:rotate-12 transition-transform">⚙️</span>
            {lang === 'bn' ? 'ম্যানেজমেন্ট ড্যাশবোর্ডে যান' : 'Go to Admin Dashboard'}
          </button>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-fadeIn bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl relative border border-white/10 animate-[scaleIn_0.3s_ease-out]">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 text-center">
              {lang === 'bn' ? 'প্রোফাইল আপডেট' : 'Edit Profile'}
            </h3>
            
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <div 
                  onClick={() => !isUploading && profilePicInputRef.current?.click()}
                  className={`w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden relative group cursor-pointer ${isUploading ? 'opacity-50' : ''}`}
                >
                  {isUploading ? (
                    <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {editUserData.avatar ? <img src={editUserData.avatar} className="w-full h-full object-cover" /> : '📸'}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[8px] text-white font-black uppercase">Change</span>
                      </div>
                    </>
                  )}
                </div>
                <input type="file" ref={profilePicInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                {error && <p className="text-[10px] text-red-500 font-bold mt-2">{error}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'bn' ? 'আপনার নাম' : 'Full Name'}</label>
                <input 
                  type="text" 
                  value={editUserData.name}
                  onChange={(e) => setEditUserData({...editUserData, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold dark:text-white focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'bn' ? 'ফোন নম্বর' : 'Phone'}</label>
                <input 
                  type="tel" 
                  value={editUserData.phone}
                  onChange={(e) => setEditUserData({...editUserData, phone: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold dark:text-white focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowEditProfileModal(false)} className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 rounded-2xl">
                  {t.CANCEL}
                </button>
                <button onClick={handleProfileSave} className="flex-1 py-4 text-xs font-black text-white uppercase tracking-widest bg-green-600 rounded-2xl shadow-lg shadow-green-100 dark:shadow-none active:scale-95">
                  {t.SAVE}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-fadeIn bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-[32px] p-8 shadow-2xl relative border border-white/10 flex flex-col items-center text-center animate-[scaleIn_0.2s_ease-out]">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center text-3xl mb-4 animate-bounce">
              🚪
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
              {lang === 'bn' ? 'লগ আউট করতে চান?' : 'Logout?'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-6">
              {lang === 'bn' 
                ? 'আপনি কি নিশ্চিত যে আপনি লগ আউট করতে চান? পরবর্তীতে আবার লগইন করতে হবে।' 
                : 'Are you sure you want to logout? You will need to login again.'
              }
            </p>
            <div className="flex w-full gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)} 
                className="flex-1 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 rounded-2xl active:scale-95 transition-all"
              >
                {t.CANCEL}
              </button>
              <button 
                onClick={onLogout} 
                className="flex-1 py-3 text-[10px] font-black text-white uppercase tracking-widest bg-red-600 rounded-2xl shadow-xl shadow-red-900/20 active:scale-95 transition-all"
              >
                {t.LOGOUT}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <MenuOption icon="📦" title={t.ORDER_HISTORY} onClick={() => onNavigate('ORDERS')} />
        <MenuOption icon="📍" title={t.DELIVERY_ADDRESS} onClick={() => onNavigate('ADDRESS_LIST')} />
        <MenuOption icon="📜" title={lang === 'bn' ? 'প্রাইভেসি পলিসি' : 'Privacy Policy'} onClick={() => onShowLegal('PRIVACY')} />
        <MenuOption icon="⚖️" title={lang === 'bn' ? 'টার্মস এন্ড কন্ডিশন' : 'Terms & Conditions'} onClick={() => onShowLegal('TERMS')} />
        <MenuOption icon="🧮" title={lang === 'bn' ? 'বাজার ক্যালকুলেটর' : 'Bazar Calculator'} onClick={() => onNavigate('BAZAR_CALCULATOR')} />
        <MenuOption icon="⚙️" title={t.SETTINGS} onClick={() => onNavigate('SETTINGS')} />
        <MenuOption icon="🚪" title={t.LOGOUT} isDanger last onClick={() => setShowLogoutConfirm(true)} />
      </div>

      <div 
        onClick={handleDeveloperClick}
        className="mt-8 bg-slate-900 rounded-[32px] p-6 shadow-2xl text-center relative overflow-hidden cursor-pointer active:scale-95 transition-transform group"
      >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 opacity-20"></div>
          <h3 className="text-white text-[11px] font-black uppercase tracking-[0.4em] group-hover:text-green-400 transition-colors">© Tamim Hasan Shaon</h3>
          <p className="text-[10px] text-slate-500 font-bold mt-1 tracking-tight italic group-hover:text-slate-400 transition-colors">AYAT'S STUDIO™ Digital Innovations</p>
      </div>
    </div>
  );
};

const MenuOption: React.FC<{ icon: string; title: string; last?: boolean; isDanger?: boolean; onClick?: () => void }> = ({ icon, title, last, isDanger, onClick }) => (
  <div onClick={onClick} className={`flex items-center justify-between p-4 ${!last ? 'border-b border-gray-50 dark:border-slate-800' : ''} cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group`}>
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl ${isDanger ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-slate-800'} flex items-center justify-center text-lg group-active:scale-90 transition-transform`}>
        {icon}
      </div>
      <span className={`font-semibold ${isDanger ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'} text-sm`}>{title}</span>
    </div>
    <span className="text-gray-300 dark:text-gray-600 text-xs font-bold">❯</span>
  </div>
);

export default ProfileScreen;