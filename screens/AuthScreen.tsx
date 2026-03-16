import React, { useState } from 'react';
import { User, SystemSettings } from '../types';
import { storage } from '../utils/storage';
import { auth, db, signInWithGoogle, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  settings: SystemSettings;
}

type AuthMode = 'LOGIN' | 'REGISTER';

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, settings }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();

    if (!trimmedPhone || !trimmedPassword || (mode === 'REGISTER' && !trimmedName)) {
      setError('দয়া করে সব ঘর পূরণ করুন');
      return;
    }

    setIsLoading(true);

    try {
      // For this app, we'll use email-like login for Firebase Auth
      // by appending a dummy domain to the phone number
      const email = `${trimmedPhone}@bismillah.com`;

      if (mode === 'LOGIN') {
        const userCredential = await signInWithEmailAndPassword(auth, email, trimmedPassword);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        
        if (userDoc.exists()) {
          onLogin(userDoc.data() as User);
        } else {
          // Fallback for special accounts or if doc missing
          const userData: User = {
            id: userCredential.user.uid,
            name: userCredential.user.displayName || 'User',
            phone: trimmedPhone,
            isAdmin: trimmedPhone === 'admin',
          };
          onLogin(userData);
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, trimmedPassword);
        const newUser: User = {
          id: userCredential.user.uid,
          name: trimmedName,
          phone: trimmedPhone,
          isAdmin: false,
        };
        await setDoc(doc(db, 'users', newUser.id), newUser);
        onLogin(newUser);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('ফোন নম্বর বা পাসওয়ার্ড সঠিক নয়');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('এই নম্বরটি ইতিমধ্যে ব্যবহার করা হয়েছে');
      } else {
        setError('একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (userDoc.exists()) {
        onLogin(userDoc.data() as User);
      } else {
        const newUser: User = {
          id: result.user.uid,
          name: result.user.displayName || 'Google User',
          phone: result.user.phoneNumber || '',
          avatar: result.user.photoURL || undefined,
          isAdmin: false,
        };
        await setDoc(doc(db, 'users', newUser.id), newUser);
        onLogin(newUser);
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError('গুগল লগইন ব্যর্থ হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    const adminNumber = settings.supportPhone.replace(/\D/g, ''); // Use support phone from settings
    const fmtPhone = adminNumber.startsWith('88') ? adminNumber : (adminNumber.startsWith('0') ? '88' + adminNumber : '880' + adminNumber);
    
    let message = "আসসালামু আলাইকুম এডমিন,\n\nআমি আমার বিসমিল্লাহ সুপার মার্কেট অ্যাকাউন্টের পাসওয়ার্ড ভুলে গেছি। দয়া করে আমাকে পাসওয়ার্ড রিসেট করতে সাহায্য করুন।";

    if (phone.trim()) {
        message += `\n\nআমার ফোন নম্বর: ${phone.trim()}`;
    } else {
        message += `\n(আমি লগইন পেজ থেকে মেসেজটি দিচ্ছি)`;
    }

    const url = `https://wa.me/${fmtPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleDeveloperClick = () => {
    window.open('https://www.facebook.com/tamimhasanshaon2', '_blank');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-fadeIn transition-colors">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="w-48 h-48 mx-auto mb-4 flex items-center justify-center bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl shadow-green-100 dark:shadow-none border border-green-50 dark:border-slate-800 p-2 overflow-hidden relative">
             <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-50"></div>
             <img 
              src={settings.storeLogo} 
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
              {mode === 'LOGIN' ? 'Welcome Back' : 'Join Our Family'}
            </p>
            <span className="w-2 h-0.5 bg-green-500 rounded-full"></span>
          </div>
        </div>

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
                    onClick={handleForgotPassword}
                    className="text-[10px] font-black text-green-600 hover:text-green-700 uppercase flex items-center gap-1"
                  >
                    <span>💬</span> পাসওয়ার্ড ভুলে গেছেন?
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

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-slate-800"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-black text-gray-400"><span className="bg-white dark:bg-slate-950 px-4">Or continue with</span></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-gray-700 dark:text-white py-4 rounded-2xl font-black text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <img src="https://cdn-icons-png.flaticon.com/512/300/300221.png" className="w-5 h-5" alt="Google" />
          Google দিয়ে লগইন করুন
        </button>

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

        <div 
          onClick={handleDeveloperClick}
          className="pt-10 flex flex-col items-center gap-4 border-t border-gray-50 dark:border-slate-900 cursor-pointer group active:scale-95 transition-transform"
        >
          <p className="text-[9px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest text-center group-hover:text-green-600 transition-colors">Premium Grocery Experience • Powered by AYAT'S STUDIO™</p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;