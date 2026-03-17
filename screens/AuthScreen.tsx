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

    if (trimmedPassword.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    setIsLoading(true);

    // Admin login logic
    if (mode === 'LOGIN' && trimmedPhone === 'admin' && trimmedPassword === '224280') {
      try {
        const adminEmail = 'admin@bismillah.com';
        const internalPassword = 'bismillah224280';
        let userCredential;
        
        try {
          userCredential = await signInWithEmailAndPassword(auth, adminEmail, internalPassword);
        } catch (signInErr: any) {
          if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
            // If sign in fails due to invalid credentials (password change), 
            // we try to create or we might need to handle password update.
            // For this applet, we'll try to create, and if it exists, we'll just report error
            // unless we want to be more sophisticated.
            try {
              userCredential = await createUserWithEmailAndPassword(auth, adminEmail, internalPassword);
              const adminUser: User = {
                id: userCredential.user.uid,
                name: 'Admin User',
                phone: 'admin',
                email: adminEmail,
                isAdmin: true,
              };
              await setDoc(doc(db, 'users', adminUser.id), adminUser);
            } catch (createErr: any) {
              if (createErr.code === 'auth/email-already-in-use') {
                // This happens if the password was changed in code but not in Firebase
                setError('এডমিন পাসওয়ার্ড আপডেট প্রয়োজন। দয়া করে ডেভেলপারকে জানান।');
                setIsLoading(false);
                return;
              }
              throw createErr;
            }
          } else {
            throw signInErr;
          }
        }

        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists()) {
          onLogin(userDoc.data() as User);
        } else {
          const adminUser: User = {
            id: userCredential.user.uid,
            name: 'Admin User',
            phone: 'admin',
            email: adminEmail,
            isAdmin: true,
          };
          await setDoc(doc(db, 'users', adminUser.id), adminUser);
          onLogin(adminUser);
        }
      } catch (err: any) {
        console.error("Admin auth error:", err);
        setError('লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Regular user login/register logic
    try {
      const userEmail = `${trimmedPhone}@bismillah.com`;
      let userCredential;

      if (mode === 'LOGIN') {
        userCredential = await signInWithEmailAndPassword(auth, userEmail, trimmedPassword);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists()) {
          onLogin(userDoc.data() as User);
        } else {
          setError('ইউজার ডাটা পাওয়া যায়নি');
        }
      } else {
        // REGISTER
        userCredential = await createUserWithEmailAndPassword(auth, userEmail, trimmedPassword);
        const newUser: User = {
          id: userCredential.user.uid,
          name: trimmedName,
          phone: trimmedPhone,
          email: userEmail,
          isAdmin: false,
        };
        await setDoc(doc(db, 'users', newUser.id), newUser);
        onLogin(newUser);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('ফোন নাম্বার বা পাসওয়ার্ড সঠিক নয়');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('এই ফোন নাম্বারটি ইতিমধ্যে ব্যবহার করা হয়েছে');
      } else {
        setError('অথেনটিকেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithGoogle();
      if (!result.user) throw new Error('No user returned from Google');

      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (userDoc.exists()) {
        onLogin(userDoc.data() as User);
      } else {
        const newUser: User = {
          id: result.user.uid,
          name: result.user.displayName || 'Google User',
          phone: result.user.phoneNumber || '',
          email: result.user.email || undefined,
          avatar: result.user.photoURL || undefined,
          isAdmin: false,
        };
        await setDoc(doc(db, 'users', newUser.id), newUser);
        onLogin(newUser);
      }
    } catch (err: any) {
      console.error("Google login error details:", err);
      if (err.code === 'auth/popup-blocked') {
        setError('পপ-আপ ব্লক করা হয়েছে। দয়া করে পপ-আপ এলাউ করুন।');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // User closed the popup, don't show error
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('লগইন উইন্ডো বন্ধ করা হয়েছে');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('এই ডোমেইনটি অথরাইজড নয়। দয়া করে এডমিনকে জানান।');
      } else {
        setError(`গুগল লগইন ব্যর্থ হয়েছে: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
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
              referrerPolicy="no-referrer"
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
              {mode === 'LOGIN' ? 'Welcome Back' : 'Create Account'}
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all font-bold text-sm dark:text-white" 
                  placeholder="আপনার নাম লিখুন"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">ফোন নাম্বার</label>
              <input 
                type="text" 
                autoComplete="username"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all font-bold text-sm dark:text-white" 
                placeholder="017XXXXXXXX"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">পাসওয়ার্ড</label>
              <input 
                type="password" 
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all font-bold text-sm dark:text-white" 
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl border animate-bounce text-center bg-red-50 border-red-100 text-red-500">
                <p className="text-[11px] font-bold">
                  ⚠️ {error}
                </p>
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
                mode === 'LOGIN' ? 'লগইন করুন' : 'রেজিস্ট্রেশন করুন'
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
                  setError('');
                }}
                className="text-[11px] font-black text-green-600 uppercase tracking-widest hover:underline"
              >
                {mode === 'LOGIN' ? 'নতুন একাউন্ট খুলুন' : 'ইতিমধ্যে একাউন্ট আছে? লগইন করুন'}
              </button>
            </div>
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
          <img src="https://cdn-icons-png.flaticon.com/512/300/300221.png" className="w-5 h-5" alt="Google" referrerPolicy="no-referrer" />
          Google দিয়ে লগইন করুন
        </button>

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