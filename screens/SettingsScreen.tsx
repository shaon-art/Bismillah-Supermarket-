import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { Screen } from '../types';

interface SettingsScreenProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  language: 'bn' | 'en';
  onSetLanguage: (lang: 'bn' | 'en') => void;
  notifications: boolean;
  onToggleNotifications: () => void;
  sounds: boolean;
  onToggleSounds: () => void;
  onBack: () => void;
  onLogout: () => void;
  isAdmin?: boolean;
  onNavigate?: (screen: Screen) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  isDarkMode, 
  onToggleDarkMode, 
  language, 
  onSetLanguage,
  notifications,
  onToggleNotifications,
  sounds,
  onToggleSounds,
  onBack,
  onLogout,
  isAdmin,
  onNavigate
}) => {
  const [showLangModal, setShowLangModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const t = TRANSLATIONS[language];

  return (
    <div className="animate-fadeIn min-h-full bg-gray-50 dark:bg-slate-950 pb-10 flex flex-col transition-colors duration-300 text-gray-900 dark:text-white">
      <div className="bg-white dark:bg-slate-900 px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-4 sticky top-0 z-40">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400 active:scale-90 transition-transform"
        >
          <span className="text-xl">←</span>
        </button>
        <h2 className="text-lg font-bold">{t.SETTINGS}</h2>
      </div>

      <div className="p-5 space-y-6">
        {isAdmin && (
          <section className="space-y-3">
            <h3 className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest ml-1">
              🛡️ {language === 'bn' ? 'সিস্টেম অ্যাডমিন' : 'System Admin'}
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-orange-100 dark:border-orange-900/20 overflow-hidden">
               <button 
                onClick={() => onNavigate?.('ADMIN_CONTROL')}
                className="w-full flex items-center justify-between p-4 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
               >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center text-lg">⚙️</div>
                    <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">
                      {language === 'bn' ? 'সিস্টেম কন্ট্রোল সেন্টার' : 'System Control Center'}
                    </span>
                  </div>
                  <span className="text-gray-300 dark:text-gray-600 text-xs font-bold">❯</span>
               </button>
            </div>
          </section>
        )}

        <section className="space-y-3">
          <h3 className="text-xs font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest ml-1">
            {language === 'bn' ? 'অ্যাপ সেটআপ' : 'App Setup'}
          </h3>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <SettingItem 
              icon="🌍" 
              title={t.LANGUAGE} 
              value={language === 'bn' ? 'বাংলা' : 'English'} 
              onClick={() => setShowLangModal(true)} 
            />
            <SettingItem 
              icon="🌙" 
              title={t.DARK_MODE} 
              hasSwitch 
              active={isDarkMode} 
              onToggle={onToggleDarkMode} 
              last 
            />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest ml-1">
            {language === 'bn' ? 'এলার্ট ও শব্দ' : 'Alerts & Sounds'}
          </h3>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <SettingItem 
              icon="🔔" 
              title={t.NOTIFICATIONS} 
              hasSwitch 
              active={notifications} 
              onToggle={onToggleNotifications} 
            />
            <SettingItem 
              icon="🔊" 
              title={language === 'bn' ? 'অ্যাপ সাউন্ড' : 'App Sound'} 
              hasSwitch 
              active={sounds} 
              onToggle={onToggleSounds} 
              last 
            />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest ml-1">
            {language === 'bn' ? 'অ্যাকাউন্ট ও সাপোর্ট' : 'Account & Support'}
          </h3>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <SettingItem icon="📄" title={language === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'} />
            <SettingItem icon="📝" title={language === 'bn' ? 'শর্তাবলী' : 'Terms & Conditions'} />
            <SettingItem 
              icon="🚪" 
              title={t.LOGOUT} 
              onClick={() => setShowLogoutConfirm(true)} 
              isDanger
              last 
            />
          </div>
        </section>
      </div>

      {showLangModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fadeIn">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLangModal(false)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative animate-[slideUp_0.3s_ease-out]">
            <div className="w-12 h-1 bg-gray-200 dark:bg-slate-800 rounded-full mx-auto mb-6 sm:hidden"></div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              {language === 'bn' ? 'ভাষা নির্বাচন করুন' : 'Choose Language'}
            </h3>
            
            <div className="space-y-3 mb-8">
              <LanguageOption 
                label="বাংলা (Bangla)" 
                active={language === 'bn'} 
                onClick={() => { onSetLanguage('bn'); setShowLangModal(false); }} 
              />
              <LanguageOption 
                label="English" 
                active={language === 'en'} 
                onClick={() => { onSetLanguage('en'); setShowLangModal(false); }} 
              />
            </div>

            <button 
              onClick={() => setShowLangModal(false)}
              className="w-full py-4 text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 rounded-2xl active:scale-95 transition-all"
            >
              {t.CANCEL}
            </button>
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
              {language === 'bn' ? 'লগ আউট করতে চান?' : 'Logout?'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-6">
              {language === 'bn' 
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

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

interface SettingItemProps {
  icon: string;
  title: string;
  value?: string;
  hasSwitch?: boolean;
  active?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
  last?: boolean;
  isDanger?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, title, value, hasSwitch, active, onToggle, onClick, last, isDanger }) => (
  <div 
    onClick={!hasSwitch ? onClick : undefined}
    className={`flex items-center justify-between p-4 ${!last ? 'border-b border-gray-50 dark:border-slate-800' : ''} ${!hasSwitch ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800' : ''} transition-colors`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isDanger ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-slate-800'}`}>{icon}</div>
      <span className={`font-semibold text-sm ${isDanger ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'}`}>{title}</span>
    </div>
    <div className="flex items-center gap-3">
      {value && <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded-lg">{value}</span>}
      {hasSwitch && (
        <button 
          onClick={onToggle}
          className={`w-10 h-5 rounded-full transition-colors relative ${active ? 'bg-green-600' : 'bg-gray-200 dark:bg-slate-700'}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${active ? 'left-5' : 'left-0.5'}`}></div>
        </button>
      )}
      {!hasSwitch && !value && <span className="text-gray-300 dark:text-gray-600 text-xs font-bold">❯</span>}
    </div>
  </div>
);

const LanguageOption: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
      active ? 'border-green-600 bg-green-50 dark:bg-green-950/20' : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900'
    }`}
  >
    <span className={`font-bold ${active ? 'text-green-900 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>{label}</span>
    {active && <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>}
  </button>
);

export default SettingsScreen;