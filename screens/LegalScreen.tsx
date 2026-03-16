
import React from 'react';

interface LegalScreenProps {
  type: 'PRIVACY' | 'TERMS';
  onBack: () => void;
  lang: 'bn' | 'en';
}

const LegalScreen: React.FC<LegalScreenProps> = ({ type, onBack, lang }) => {
  const isPrivacy = type === 'PRIVACY';
  
  const content = {
    PRIVACY: {
      title: lang === 'bn' ? 'প্রাইভেসি পলিসি' : 'Privacy Policy',
      content: lang === 'bn' ? `
        বিসমিল্লাহ সুপার মার্কেটে আপনার গোপনীয়তা আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ। 
        আমরা আপনার নাম, ফোন নম্বর এবং ঠিকানা সংগ্রহ করি শুধুমাত্র আপনার অর্ডার ডেলিভারি করার জন্য। 
        আমরা আপনার তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করি না।
      ` : `
        At Bismillah Supermarket, your privacy is extremely important to us. 
        We collect your name, phone number, and address solely for the purpose of delivering your orders. 
        We do not sell or share your information with any third parties.
      `
    },
    TERMS: {
      title: lang === 'bn' ? 'টার্মস এন্ড কন্ডিশন' : 'Terms & Conditions',
      content: lang === 'bn' ? `
        ১. অর্ডার করার পর আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।
        ২. পণ্যের দাম বাজারের সাথে পরিবর্তনশীল হতে পারে।
        ৩. ডেলিভারি চার্জ এলাকাভেদে ভিন্ন হতে পারে।
        ৪. কোনো পণ্য স্টকে না থাকলে আমরা আপনাকে অবহিত করব।
      ` : `
        1. After placing an order, our representative will contact you.
        2. Product prices may vary according to the market.
        3. Delivery charges may vary by area.
        4. If any product is out of stock, we will inform you.
      `
    }
  };

  return (
    <div className="min-h-full bg-white dark:bg-slate-950 flex flex-col transition-colors">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-4 sticky top-0 z-40">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-300 active:scale-90 transition-transform">
          ←
        </button>
        <h2 className="text-lg font-black text-gray-900 dark:text-white">{content[type].title}</h2>
      </div>
      
      <div className="p-6 space-y-6 overflow-y-auto">
        <div className="bg-gray-50 dark:bg-slate-900 p-6 rounded-[32px] border border-gray-100 dark:border-slate-800">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line font-medium">
            {content[type].content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalScreen;
