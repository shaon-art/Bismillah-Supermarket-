
import React from 'react';

interface GuideScreenProps {
  onBack: () => void;
}

const GuideScreen: React.FC<GuideScreenProps> = ({ onBack }) => {
  return (
    <div className="p-4 space-y-6 animate-fadeIn bg-white min-h-full">
      <div className="border-b pb-4 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-green-800">Bismillah Supermarket - Developer Guide</h2>
          <p className="text-sm text-gray-600">Complete Android Development Blueprint</p>
        </div>
        <button 
          onClick={onBack}
          className="bg-gray-100 text-gray-600 p-2 rounded-xl text-sm font-bold"
        >
          বন্ধ করুন
        </button>
      </div>

      {/* Section 1: Architecture */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold flex items-center gap-2 text-red-600">
          <span className="bg-red-100 p-1 rounded">🏗️</span> App Flow & Architecture
        </h3>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm space-y-2">
          <p><strong>Pattern:</strong> MVVM (Model-View-ViewModel) + Clean Architecture</p>
          <p><strong>Flow:</strong> Splash ➔ Auth (OTP) ➔ Home ➔ Category ➔ Detail ➔ Cart ➔ Checkout ➔ Order Success ➔ Tracking</p>
        </div>
      </section>

      {/* Section 2: Tech Stack */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold flex items-center gap-2 text-green-700">
          <span className="bg-green-100 p-1 rounded">💻</span> Recommended Tech Stack
        </h3>
        <ul className="grid grid-cols-2 gap-2 text-[13px]">
          <li className="bg-blue-50 p-2 rounded-lg border border-blue-100"><strong>Frontend:</strong> Flutter (for cross-platform) or Kotlin (Native)</li>
          <li className="bg-yellow-50 p-2 rounded-lg border border-yellow-100"><strong>Backend:</strong> Firebase (Fastest) or Node.js + MongoDB</li>
          <li className="bg-green-50 p-2 rounded-lg border border-green-100"><strong>Auth:</strong> Firebase Phone Auth</li>
          <li className="bg-purple-50 p-2 rounded-lg border border-purple-100"><strong>Storage:</strong> Firebase Cloud Storage (for images)</li>
        </ul>
      </section>

      {/* Section 3: Database Structure */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold flex items-center gap-2 text-blue-600">
          <span className="bg-blue-100 p-1 rounded">🗄️</span> Database Structure (Firestore)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Collection</th>
                <th className="p-2 border">Fields</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border font-bold">Users</td>
                <td className="p-2 border">uid, name, phone, address, fcm_token</td>
              </tr>
              <tr>
                <td className="p-2 border font-bold">Products</td>
                <td className="p-2 border">id, name, desc, price, oldPrice, categoryId, image_url, stock</td>
              </tr>
              <tr>
                <td className="p-2 border font-bold">Categories</td>
                <td className="p-2 border">id, name_bn, icon_url</td>
              </tr>
              <tr>
                <td className="p-2 border font-bold">Orders</td>
                <td className="p-2 border">orderId, userId, items[], total, status, timestamp</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: Steps to build */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold flex items-center gap-2 text-orange-600">
          <span className="bg-orange-100 p-1 rounded">🚀</span> App Building Steps
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex gap-3">
            <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
            <p><strong>Setup Firebase:</strong> Create project in console, add google-services.json.</p>
          </div>
          <div className="flex gap-3">
            <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
            <p><strong>Design UI:</strong> Use Material 3 (Android) or Flutter Widgets for this layout.</p>
          </div>
          <div className="flex gap-3">
            <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
            <p><strong>Auth Logic:</strong> Implement `verifyPhoneNumber` using Firebase SDK.</p>
          </div>
          <div className="flex gap-3">
            <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
            <p><strong>Cart Management:</strong> Use Local Storage (SharedPreferences/Hive) to keep items.</p>
          </div>
        </div>
      </section>

      {/* Developer Profile Section */}
      <section className="mt-10 p-6 bg-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-green-500/50">👨‍💻</div>
            <div>
              <h4 className="text-xl font-black text-white leading-tight">Tamim Hasan Shaon</h4>
              <p className="text-green-400 text-xs font-bold uppercase tracking-widest">AYAT'S STUDIO™</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3 pt-2">
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
              <span className="text-xl">📧</span>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Contact Email</span>
                <a href="mailto:tamimshaon@gmail.com" className="text-sm font-bold hover:text-green-400 transition-colors">tamimshaon@gmail.com</a>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
              <span className="text-xl">🏢</span>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Company</span>
                <span className="text-sm font-bold">AYAT'S STUDIO™ - Digital Solutions</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-950/40 rounded-2xl border border-green-900/50 text-center">
            <p className="text-[11px] font-medium text-green-200">
              © 2024 AYAT'S STUDIO™. All Rights Reserved. Designed with passion for Bismillah Supermarket.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GuideScreen;
