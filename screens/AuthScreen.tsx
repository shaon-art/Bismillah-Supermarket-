
import React, { useState } from 'react';
import { User } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';
type ForgotStep = 'PHONE' | 'OTP' | 'RESET';

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [forgotStep, setForgotStep] = useState<ForgotStep>('PHONE');
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();

    if (mode === 'LOGIN' || mode === 'REGISTER') {
      if (!trimmedPhone || !trimmedPassword || (mode === 'REGISTER' && !trimmedName)) {
        setError('দয়া করে সব ঘর পূরণ করুন');
        return;
      }
    }

    const normalizedPhone = trimmedPhone.toLowerCase();
    const isSpecialAccount = normalizedPhone === 'admin' || normalizedPhone === 'i am user';

    if (!isSpecialAccount && trimmedPhone.length < 11) {
      setError('সঠিক ফোন নম্বর প্রদান করুন (কমপক্ষে ১১ ডিজিট)');
      return;
    }

    setIsLoading(true);

    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'shaon224@';
    
    const GUEST_USER_ID = 'i am user';
    const GUEST_USER_PASS = 'user';

    setTimeout(() => {
      try {
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');

        if (mode === 'LOGIN') {
          if (normalizedPhone === ADMIN_USERNAME) {
            if (password === ADMIN_PASSWORD) {
              const adminUser: User = { id: 'admin-001', name: 'Tamim Hasan Shaon', phone: ADMIN_USERNAME, isAdmin: true };
              onLogin(adminUser);
              return;
            } else {
              setError('অ্যাডমিন পাসওয়ার্ড সঠিক নয়!');
              setIsLoading(false);
              return;
            }
          }

          if (normalizedPhone === GUEST_USER_ID) {
            if (password === GUEST_USER_PASS) {
              const normalUser: User = { id: 'u-guest-001', name: 'Regular User', phone: GUEST_USER_ID, isAdmin: false };
              onLogin(normalUser);
              return;
            } else {
              setError('পাসওয়ার্ড সঠিক নয়!');
              setIsLoading(false);
              return;
            }
          }

          const existingUser = users.find(u => u.phone.trim() === trimmedPhone);
          if (!existingUser) {
            setError('এই ফোন নম্বরটি দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি');
            setIsLoading(false);
            return;
          }

          if (existingUser.password === password) {
            onLogin(existingUser);
          } else {
            setError('পাসওয়ার্ড সঠিক নয়! দয়া করে আবার চেষ্টা করুন।');
            setIsLoading(false);
          }
        } else if (mode === 'REGISTER') {
          if (isSpecialAccount) {
            setError('এই ইউজারনেমটি ব্যবহার করা যাবে না');
            setIsLoading(false);
            return;
          }

          const phoneExists = users.some(u => u.phone.trim() === trimmedPhone);
          if (phoneExists) {
            setError('এই নম্বরটি ইতিমধ্যে ব্যবহার করা হয়েছে। দয়া করে লগইন করুন।');
            setIsLoading(false);
            return;
          }

          const newUser: User = { 
            id: 'u-' + Date.now(), 
            name: trimmedName, 
            phone: trimmedPhone, 
            password: password, 
            isAdmin: false 
          };
          
          const updatedUsers = [...users, newUser];
          localStorage.setItem('users', JSON.stringify(updatedUsers));
          onLogin(newUser);
        }
      } catch (err) {
        console.error("Auth error:", err);
        setError('একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        setIsLoading(false);
      }
    }, 800);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const userExists = users.some(u => u.phone.trim() === phone.trim()) || phone.trim() === 'admin';

      if (forgotStep === 'PHONE') {
        if (!userExists) {
          setError('এই ফোন নম্বরটি নিবন্ধিত নয়');
          return;
        }
        setForgotStep('OTP');
      } else if (forgotStep === 'OTP') {
        if (otp !== '1234') {
          setError('ভুল কোড! সঠিক কোডটি দিন (১২৩৪)');
          return;
        }
        setForgotStep('RESET');
      } else if (forgotStep === 'RESET') {
        if (password.length < 6) {
          setError('পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে');
          return;
        }
        if (password !== confirmPassword) {
          setError('পাসওয়ার্ড দুটি মেলেনি');
          return;
        }
        
        // Update password in local storage
        const updatedUsers = users.map(u => u.phone.trim() === phone.trim() ? { ...u, password } : u);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        alert('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। এখন লগইন করুন।');
        setMode('LOGIN');
        setForgotStep('PHONE');
        setPhone('');
        setPassword('');
      }
    }, 1000);
  };

  const renderForgotFlow = () => {
    switch (forgotStep) {
      case 'PHONE':
        return (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">নিবন্ধিত ফোন নম্বর</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all font-bold text-sm dark:text-white" 
                placeholder="০১৭xxxxxxxx"
              />
            </div>
            {error && <p className="text-[11px] font-bold text-red-500 text-center">⚠️ {error}</p>}
            <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl active:scale-95 flex items-center justify-center gap-3">
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'কোড পাঠান'}
            </button>
          </form>
        );
      case 'OTP':
        return (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="text-center mb-4">
               <p className="text-xs font-bold text-gray-500">আপনার {phone} নম্বরে ৪ ডিজিটের একটি কোড পাঠানো হয়েছে।</p>
               <p className="text-[10px] text-green-600 font-black mt-1 uppercase tracking-widest">(প্রোটোটাইপ কোড: ১২৩৪)</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">ভেরিফিকেশন কোড</label>
              <input 
                type="text" 
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all font-bold text-center text-lg tracking-[1em] dark:text-white" 
                placeholder="----"
              />
            </div>
            {error && <p className="text-[11px] font-bold text-red-500 text-center">⚠️ {error}</p>}
            <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl active:scale-95 flex items-center justify-center gap-3">
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'কোড যাচাই করুন'}
            </button>
          </form>
        );
      case 'RESET':
        return (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">নতুন পাসওয়ার্ড</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all font-bold text-sm dark:text-white" 
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">পাসওয়ার্ড নিশ্চিত করুন</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all font-bold text-sm dark:text-white" 
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-[11px] font-bold text-red-500 text-center">⚠️ {error}</p>}
            <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl active:scale-95 flex items-center justify-center gap-3">
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'পাসওয়ার্ড পরিবর্তন করুন'}
            </button>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-fadeIn transition-colors">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="w-48 h-48 mx-auto mb-4 flex items-center justify-center bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl shadow-green-100 dark:shadow-none border border-green-50 dark:border-slate-800 p-2 overflow-hidden relative">
             <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-50"></div>
             <img 
              src="https://raw.githubusercontent.com/BismillahSupermarket/Assets/main/logo.png" 
              alt="Bismillah Supermarket Logo" 
              className="w-full h-full object-contain relative z-10"
              onError={(e) => {
                (e.target as any).src = "https://cdn-icons-png.flaticon.com/512/3724/3724720.png";
              }}
             />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mt-6">
            বিসমিল্লাহ <span className="text-red-600">সুপার মার্কেট</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-2 h-0.5 bg-green-500 rounded-full"></span>
            <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
              {mode === 'LOGIN' ? 'Welcome Back' : mode === 'REGISTER' ? 'Join Our Family' : 'Reset Password'}
            </p>
            <span className="w-2 h-0.5 bg-green-500 rounded-full"></span>
          </div>
        </div>

        {mode === 'FORGOT_PASSWORD' ? (
          <div className="animate-fadeIn">
            {renderForgotFlow()}
            <div className="text-center mt-6">
              <button 
                type="button"
                onClick={() => { setMode('LOGIN'); setForgotStep('PHONE'); setError(''); }}
                className="text-xs font-bold text-gray-400 hover:text-green-600 transition-colors"
              >
                ← লগইন পেজে ফিরে যান
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4">
            {mode === 'REGISTER' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">আপনার নাম</label>
                <input 
                  type="text" 
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all font-bold text-sm dark:text-white" 
                  placeholder="আপনার নাম লিখুন"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">ফোন নম্বর</label>
              <input 
                type="text" 
                autoComplete="username"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all font-bold text-sm dark:text-white" 
                placeholder={mode === 'LOGIN' ? "admin / ০১৭xxxxxxxx" : "০১৭xxxxxxxx"}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">পাসওয়ার্ড</label>
                {mode === 'LOGIN' && (
                  <button 
                    type="button"
                    onClick={() => { setMode('FORGOT_PASSWORD'); setError(''); }}
                    className="text-[10px] font-black text-green-600 hover:text-green-700 uppercase"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>
                )}
              </div>
              <input 
                type="password" 
                autoComplete={mode === 'LOGIN' ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all font-bold text-sm dark:text-white" 
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className={`p-3 rounded-xl border animate-bounce text-center ${error.includes('ইতিমধ্যে') ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-red-50 border-red-100 text-red-500'}`}>
                <p className="text-[11px] font-bold">
                  ⚠️ {error}
                </p>
                {error.includes('ইতিমধ্যে') && (
                    <button 
                      type="button" 
                      onClick={() => { setMode('LOGIN'); setError(''); }}
                      className="text-[10px] font-black underline mt-1 uppercase"
                    >
                      লগইন পেজে যান
                    </button>
                )}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-green-100 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                mode === 'LOGIN' ? 'লগইন করুন' : 'অ্যাকাউন্ট খুলুন'
              )}
            </button>
          </form>
        )}

        {mode !== 'FORGOT_PASSWORD' && (
          <div className="text-center pt-4">
            <button 
              type="button"
              onClick={() => { setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN'); setError(''); }}
              className="text-xs font-bold text-gray-400 hover:text-green-600 transition-colors"
            >
              {mode === 'LOGIN' ? (
                <>অ্যাকাউন্ট নেই? <span className="text-green-600 font-black">নতুন খুলুন</span></>
              ) : (
                <>ইতিমধ্যেই অ্যাকাউন্ট আছে? <span className="text-green-600 font-black">লগইন করুন</span></>
              )}
            </button>
          </div>
        )}

        <div className="pt-10 flex flex-col items-center gap-4 border-t border-gray-50 dark:border-slate-900">
          <p className="text-[9px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest text-center">Premium Grocery Experience • Powered by AYAT'S STUDIO™</p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
