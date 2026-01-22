import React, { useState } from 'react';
import { Product, Category, SystemSettings } from '../types';

interface CategoryScreenProps {
  products: Product[];
  categories: Category[];
  onProductClick: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  settings: SystemSettings;
}

const CategoryScreen: React.FC<CategoryScreenProps> = ({ products, categories, onProductClick, onAddToCart, settings }) => {
  const [selectedCat, setSelectedCat] = useState(categories[0]?.id || '');
  const [addingId, setAddingId] = useState<string | null>(null);

  // Note: Filtered products are passed as props, but we filter again for safety
  const filteredProducts = products.filter(p => p.category === selectedCat);

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setAddingId(product.id);
    onAddToCart(product);
    setTimeout(() => setAddingId(null), 1000);
  };

  return (
    <div className="flex h-full animate-fadeIn pb-20">
      {/* Sidebar Nav */}
      <div className="w-24 bg-gray-100/50 dark:bg-slate-900/50 flex flex-col overflow-y-auto no-scrollbar border-r border-gray-100 dark:border-slate-800">
        {categories.map(cat => {
          const isActive = selectedCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`flex flex-col items-center py-5 px-1 relative transition-colors ${
                isActive ? 'bg-white dark:bg-slate-900' : 'hover:bg-gray-200/50'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1 bottom-1 w-1 bg-green-600 rounded-r-full" />
              )}
              <span className="text-2xl mb-1">{cat.icon}</span>
              <span className={`text-[10px] font-bold text-center leading-tight ${
                isActive ? 'text-green-700 dark:text-green-400' : 'text-gray-500'
              }`}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-slate-950">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 px-1">
          {categories.find(c => c.id === selectedCat)?.name} ({filteredProducts.length})
        </h2>

        {filteredProducts.length > 0 ? (
          <div className="space-y-4">
            {filteredProducts.map(product => {
              const isAdding = addingId === product.id;
              const discount = settings.globalDiscountEnabled ? settings.globalDiscountPercentage : 0;
              const displayPrice = Math.round(product.price * (1 - discount/100));
              const hasOffer = settings.globalDiscountEnabled && settings.globalDiscountPercentage > 0;

              return (
                <div 
                  key={product.id} 
                  onClick={() => onProductClick(product)}
                  className="flex gap-4 p-2 rounded-xl border border-gray-100 dark:border-slate-800 active:bg-gray-50 dark:active:bg-slate-900 transition-colors group"
                >
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full rounded-lg object-cover bg-gray-50 dark:bg-slate-800" />
                    {hasOffer && (
                      <div className="absolute top-0 left-0 bg-red-600 text-white text-[6px] font-black px-1 py-0.5 rounded-br-lg">SALE</div>
                    )}
                    {isAdding && (
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center rounded-lg animate-pulse">
                        <span className="text-white text-xl">✨</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{product.name}</h3>
                      <p className="text-[10px] text-gray-500">{product.unit}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-green-700 dark:text-green-400 font-bold">৳{displayPrice}</span>
                        {hasOffer && <span className="text-[8px] text-gray-400 line-through">৳{product.price}</span>}
                      </div>
                      <button 
                        onClick={(e) => handleAdd(e, product)}
                        className={`font-bold px-3 py-1.5 rounded-lg text-[10px] transition-all duration-300 ${
                          isAdding 
                            ? 'bg-orange-500 text-white scale-105' 
                            : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200 active:scale-95'
                        }`}
                      >
                        {isAdding ? '✓ যোগ হয়েছে' : 'যোগ করুন'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300">
            <span className="text-5xl mb-2">📦</span>
            <p className="text-sm font-medium">কোনো পণ্য পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryScreen;