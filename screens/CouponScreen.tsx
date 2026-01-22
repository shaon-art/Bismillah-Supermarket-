
import React, { useState } from 'react';

interface CouponScreenProps {
  onBack: () => void;
}

interface Coupon {
  id: string;
  code: string;
  discount: string;
  description: string;
  expiry: string;
  icon: string;
  color: string;
}

const DUMMY_COUPONS: Coupon[] = [
  {
    id: 'c1',
    code: 'BISMILLAH10',
    discount: '১০% ছাড়',
    description: '৫০০ টাকার বেশি অর্ডারে সব পণ্যে ১০% ছাড় পাবেন।',
    expiry: '৩০ জুন, ২০২৪',
    icon: '🎉',
    color: 'bg-emerald-500'
  },
  {
    id: 'c2',
    code: 'FREEDEL',
    discount: 'ফ্রি ডেলিভারি',
    description: '১০০০ টাকার বেশি অর্ডারে কোনো ডেলিভারি চার্জ নেই।',
    expiry: '১৫ জুন, ২০২৪',
    icon: '🚚',
    color: 'bg-blue-500'
  },
  {
    id: 'c3',
    code: 'VEGGIE20',
    discount: '২০% ছাড়',
    description: 'শুধু মাত্র সবজির ওপর ২০% ছাড় উপভোগ করুন।',
    expiry: '১০ জুন, ২০২৪',
    icon: '🥦',
    color: 'bg-orange-500'
  }
];

const CouponScreen: React.FC<CouponScreenProps> = ({ onBack }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="animate-fadeIn min-h-full bg-gray-50 pb-10 flex flex-col">
      {/* Header */}
      <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center gap-4 sticky top-0 z-40 shadow-sm">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 active:scale-90 transition-transform"
        >
          <span className="text-xl">←</span>
        </button>
        <h2 className="text-lg font-bold text-gray-900">কুপন ও অফার</h2>
      </div>

      <div className="p-5 space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-3xl p-6 text-white shadow-lg shadow-green-100 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-1">সুপার সেভিং ডিলস!</h3>
            <p className="text-xs text-green-100 font-medium opacity-90">আপনার প্রতিটি অর্ডারে সাশ্রয় করুন সেরা অফারের মাধ্যমে।</p>
          </div>
          <div className="absolute -right-4 -bottom-4 text-7xl opacity-10 transform -rotate-12">🎁</div>
        </div>

        {/* Coupon List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">চলমান কুপনসমূহ</h4>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{DUMMY_COUPONS.length} টি সচল</span>
          </div>

          <div className="space-y-4">
            {DUMMY_COUPONS.map((coupon) => (
              <div key={coupon.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex gap-4 group relative overflow-hidden">
                {/* Left Colored Bar */}
                <div className={`w-1.5 h-full absolute left-0 top-0 bottom-0 ${coupon.color}`}></div>
                
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl shrink-0">
                  {coupon.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h5 className="text-base font-black text-gray-900 leading-tight">{coupon.discount}</h5>
                    <div className="bg-gray-50 px-2 py-1 rounded-lg border border-dashed border-gray-200">
                       <span className="text-[10px] font-black text-green-700 tracking-wider uppercase">{coupon.code}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium mb-3 leading-relaxed">{coupon.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                      <span className="text-[9px] font-bold text-gray-400">মেয়াদ: {coupon.expiry}</span>
                    </div>
                    <button 
                      onClick={() => handleCopy(coupon.code)}
                      className={`text-[10px] font-black px-4 py-1.5 rounded-full transition-all ${
                        copiedCode === coupon.code 
                          ? 'bg-green-600 text-white' 
                          : 'bg-green-50 text-green-700 hover:bg-green-100 active:scale-95'
                      }`}
                    >
                      {copiedCode === coupon.code ? '✓ কপি হয়েছে' : 'কোড কপি করুন'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Special Offers Section */}
        <section className="space-y-4 pt-2">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">আজকের স্পেশাল অফার</h4>
          
          <div className="grid grid-cols-1 gap-4">
             <div className="bg-orange-50 rounded-3xl p-5 border border-orange-100 flex items-center justify-between shadow-sm shadow-orange-50">
                <div className="space-y-1">
                  <h5 className="text-sm font-black text-orange-900">Buy 1 Get 1 Free!</h5>
                  <p className="text-[10px] text-orange-700 font-bold opacity-80">ফ্রেশ আপেল কিনলেই পাচ্ছেন আরও একটি ফ্রি।</p>
                  <button className="mt-2 text-[9px] font-black bg-white text-orange-600 px-3 py-1 rounded-full border border-orange-200">অফারটি নিন</button>
                </div>
                <div className="text-4xl">🍎</div>
             </div>

             <div className="bg-blue-50 rounded-3xl p-5 border border-blue-100 flex items-center justify-between shadow-sm shadow-blue-50">
                <div className="space-y-1">
                  <h5 className="text-sm font-black text-blue-900">৳১০০ ক্যাশব্যাক!</h5>
                  <p className="text-[10px] text-blue-700 font-bold opacity-80">বিকাশে পেমেন্ট করলেই পাচ্ছেন নিশ্চিত ক্যাশব্যাক।</p>
                  <button className="mt-2 text-[9px] font-black bg-white text-blue-600 px-3 py-1 rounded-full border border-blue-200">বিস্তারিত</button>
                </div>
                <div className="text-4xl">📱</div>
             </div>
          </div>
        </section>

        {/* Extra Info */}
        <div className="p-4 bg-gray-100 rounded-2xl text-center">
          <p className="text-[10px] text-gray-400 font-medium">অফারসমূহ ব্যবহারের পূর্বে আমাদের <span className="text-green-600 font-bold underline">শর্তাবলী</span> দেখে নিন।</p>
        </div>
      </div>
    </div>
  );
};

export default CouponScreen;
