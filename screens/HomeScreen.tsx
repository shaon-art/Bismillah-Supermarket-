
import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { Product, Category, Screen, SystemSettings } from '../types';

interface HomeScreenProps {
  products: Product[];
  categories: Category[];
  recentlyViewed: Product[];
  onProductClick: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onNavigate: (screen: Screen) => void;
  lang: 'bn' | 'en';
  settings: SystemSettings;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ products, categories, recentlyViewed, onProductClick, onAddToCart, onNavigate, lang, settings }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="space-y-6 animate-fadeIn pb-6">
      {/* Modern Search Bar */}
      <div className="px-5 mt-4">
        <div className="relative group">
          <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder={t.SEARCH_HINT}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-900 border-none focus:ring-2 focus:ring-green-500/20 text-sm transition-all outline-none dark:text-white"
          />
        </div>
      </div>

      {/* Modern Promo Banners */}
      <div className="px-5">
        <div className={`w-full h-36 rounded-2xl ${settings.globalDiscountEnabled ? 'bg-orange-600' : 'bg-green-600'} relative overflow-hidden flex items-center shadow-lg shadow-green-100 transition-colors duration-500`}>
          <div className="pl-6 pr-4 z-10 w-2/3">
            <h2 className="text-xl font-bold text-white leading-tight">
              {settings.globalDiscountEnabled 
                ? (lang === 'bn' ? `সবকিছুতে ${settings.globalDiscountPercentage}% ছাড়!` : `Flat ${settings.globalDiscountPercentage}% Off All!`)
                : (lang === 'bn' ? 'সেরা ডিল!' : 'Best Deal!')
              }
            </h2>
            <p className="text-white/80 text-xs mt-1">
              {lang === 'bn' ? 'তাজা পণ্যের সমাহার নিয়ে আমরা আছি আপনার পাশে।' : 'Quality groceries delivered to your doorstep.'}
            </p>
            <button 
              onClick={() => onNavigate('COUPONS')}
              className="mt-3 bg-white text-orange-700 text-[10px] font-bold px-4 py-1.5 rounded-full shadow-sm uppercase tracking-wide hover:bg-green-50 transition-colors"
            >
              {lang === 'bn' ? 'অফার দেখুন' : 'View Offers'}
            </button>
          </div>
          <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300" 
               className="absolute right-[-20px] top-0 h-full w-1/2 object-cover opacity-60" alt="banner" />
        </div>
      </div>

      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <section className="px-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-sm">🕒</span> {lang === 'bn' ? 'সম্প্রতি দেখা পণ্য' : 'Recently Viewed'}
            </h3>
          </div>
          <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar">
            {recentlyViewed.map(product => {
              const discount = settings.globalDiscountEnabled ? settings.globalDiscountPercentage : 0;
              const displayPrice = Math.round(product.price * (1 - discount/100));
              
              return (
                <div 
                  key={`rv-${product.id}`} 
                  onClick={() => onProductClick(product)}
                  className="flex-shrink-0 w-28 group cursor-pointer"
                >
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 group-active:scale-95 transition-transform mb-1">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-800 dark:text-gray-300 line-clamp-1 text-center">{product.name}</p>
                  <p className="text-[9px] text-green-700 dark:text-green-400 font-bold text-center">৳{displayPrice}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Horizontal Categories */}
      <section className="px-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">{t.CATEGORIES}</h3>
          <button className="text-xs font-bold text-green-600">{lang === 'bn' ? 'সবগুলো' : 'See All'}</button>
        </div>
        <div className="flex overflow-x-auto pb-2 gap-4 no-scrollbar">
          {categories.map(cat => (
            <div key={cat.id} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
              <div className={`${cat.color} dark:bg-opacity-20 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white dark:border-slate-800 group-active:scale-95 transition-transform`}>
                {cat.icon}
              </div>
              <span className="text-[11px] font-medium text-gray-700 dark:text-gray-400">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section className="px-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">{t.FEATURED}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {products.map(product => (
            <GroceryCard 
              key={product.id} 
              product={product} 
              onClick={() => onProductClick(product)} 
              onAdd={() => onAddToCart(product)} 
              lang={lang}
              settings={settings}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

const GroceryCard: React.FC<{ product: Product; onClick: () => void; onAdd: () => void; lang: 'bn' | 'en'; settings: SystemSettings }> = ({ product, onClick, onAdd, lang, settings }) => {
  const [isAdding, setIsAdding] = useState(false);
  const t = TRANSLATIONS[lang];

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    onAdd();
    setTimeout(() => setIsAdding(false), 800);
  };

  const isPopular = product.price > 200 || product.stock < 30;
  
  // Calculated Prices
  const discount = settings.globalDiscountEnabled ? settings.globalDiscountPercentage : 0;
  const displayPrice = Math.round(product.price * (1 - discount / 100));
  const hasGlobalOffer = settings.globalDiscountEnabled && settings.globalDiscountPercentage > 0;
  const shownOldPrice = hasGlobalOffer ? product.price : product.oldPrice;

  return (
    <div 
      className="bg-white dark:bg-slate-900 rounded-xl p-3 flex flex-col shadow-sm border border-gray-100 dark:border-slate-800 active:scale-98 transition-all hover:border-green-100 dark:hover:border-green-900 cursor-pointer relative"
      onClick={onClick}
    >
      <div className="relative aspect-square w-full mb-3 rounded-lg overflow-hidden bg-gray-50 dark:bg-slate-800">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        
        {hasGlobalOffer && (
           <div className="absolute top-2 left-2 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded shadow-lg z-10 animate-pulse">
             {settings.globalDiscountPercentage}% OFF
           </div>
        )}
        
        {!hasGlobalOffer && product.oldPrice && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">
            {t.OFF}
          </div>
        )}

        {isPopular && (
          <div className="absolute bottom-1 right-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[8px] font-black text-green-800 dark:text-green-400 px-1.5 py-0.5 rounded border border-green-50 dark:border-green-900 shadow-sm flex items-center gap-0.5 uppercase tracking-tighter">
            <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
            {t.POPULAR}
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 mb-0.5">{product.name}</h4>
        <p className="text-[10px] text-gray-500 mb-2">{product.unit}</p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-green-700 dark:text-green-400 font-black text-sm">৳{displayPrice}</span>
            {shownOldPrice && (
              <span className="text-gray-300 dark:text-gray-600 line-through text-[10px]">৳{shownOldPrice}</span>
            )}
          </div>
          <button 
            onClick={handleAdd}
            className={`relative overflow-hidden w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 transform ${
              isAdding ? 'bg-orange-500 scale-110 rotate-[360deg]' : 'bg-green-600 active:scale-90 hover:bg-green-700'
            } text-white shadow-sm`}
          >
            {isAdding ? <span className="text-sm font-bold animate-pulse">✓</span> : <span className="text-lg font-bold">+</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
