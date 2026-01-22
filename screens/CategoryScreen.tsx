
import React, { useState, useEffect } from 'react';
import { Product, Category, SystemSettings } from '../types';

interface CategoryScreenProps {
  products: Product[];
  categories: Category[];
  onProductClick: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  settings: SystemSettings;
  initialCategoryId?: string;
}

const CategoryScreen: React.FC<CategoryScreenProps> = ({ 
  products, 
  categories, 
  onProductClick, 
  onAddToCart, 
  settings,
  initialCategoryId 
}) => {
  const [selectedCat, setSelectedCat] = useState(initialCategoryId || categories[0]?.id || '');
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (initialCategoryId) {
      setSelectedCat(initialCategoryId);
    }
  }, [initialCategoryId]);

  // Filter products by selected category and active status
  const filteredProducts = products.filter(p => p.category === selectedCat && p.isActive);

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    
    setAddingId(product.id);
    onAddToCart(product);
    setTimeout(() => setAddingId(null), 800);
  };

  const currentCategory = categories.find(c => c.id === selectedCat);

  return (
    <div className="flex h-full animate-fadeIn pb-20 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Left Sidebar - Categories */}
      <div className="w-[88px] bg-white dark:bg-slate-900 flex flex-col overflow-y-auto no-scrollbar border-r border-slate-100 dark:border-slate-800 shadow-sm z-10 pb-24">
        {categories.map(cat => {
          const isActive = selectedCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`flex flex-col items-center justify-center py-4 px-1 relative transition-all duration-300 group ${
                isActive ? 'bg-green-50/50 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-green-600 rounded-r-full shadow-lg shadow-green-200 dark:shadow-none" />
              )}
              <div className={`text-2xl mb-1.5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'} filter drop-shadow-sm`}>
                {cat.icon}
              </div>
              <span className={`text-[9px] font-bold text-center leading-tight px-1 transition-colors ${
                isActive ? 'text-green-700 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'
              }`}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Content - Product List */}
      <div className="flex-1 overflow-y-auto p-4 relative bg-slate-50 dark:bg-slate-950 no-scrollbar pb-24">
        {/* Category Header */}
        <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm py-2 mb-2 flex justify-between items-end border-b border-slate-100 dark:border-slate-800">
           <div>
             <h2 className="text-lg font-black text-slate-900 dark:text-white leading-none">
               {currentCategory?.name || 'Category'}
             </h2>
             <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
               {filteredProducts.length} Products Found
             </p>
           </div>
           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${currentCategory?.color || 'bg-gray-100'}`}>
              {currentCategory?.icon}
           </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredProducts.map(product => {
              const isAdding = addingId === product.id;
              // Calculate Display Price based on Global Settings
              const discount = settings.globalDiscountEnabled ? settings.globalDiscountPercentage : 0;
              const displayPrice = Math.round(product.price * (1 - discount/100));
              const hasOffer = settings.globalDiscountEnabled && settings.globalDiscountPercentage > 0;
              const isOutOfStock = product.stock <= 0;

              return (
                <div 
                  key={product.id} 
                  onClick={() => onProductClick(product)}
                  className={`bg-white dark:bg-slate-900 p-3 rounded-[20px] flex gap-3 border border-slate-100 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-all duration-300 relative overflow-hidden group ${
                    isOutOfStock ? 'opacity-60 grayscale' : ''
                  }`}
                >
                  {/* Product Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-overlay" />
                    <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                    
                    {hasOffer && !isOutOfStock && (
                      <div className="absolute top-0 left-0 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-br-lg shadow-sm z-10">
                        -{discount}%
                      </div>
                    )}
                    
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-[8px] font-black text-white uppercase tracking-widest border border-white/50 px-1 py-0.5 rounded">Stock Out</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                    <div>
                      <h3 className="text-[13px] font-black text-slate-800 dark:text-slate-100 leading-tight mb-1 truncate pr-4">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 inline-block px-1.5 py-0.5 rounded-md">
                        {product.unit}
                      </p>
                    </div>

                    <div className="flex items-end justify-between mt-2">
                      <div className="flex flex-col">
                         {hasOffer && (
                           <span className="text-[9px] text-slate-400 line-through font-bold">৳{product.price}</span>
                         )}
                         <span className={`text-base font-black ${hasOffer ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                           ৳{displayPrice}
                         </span>
                      </div>

                      <button 
                        onClick={(e) => handleAdd(e, product)}
                        disabled={isOutOfStock}
                        className={`h-9 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all duration-300 ${
                          isOutOfStock 
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                            : isAdding
                              ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 w-full ml-4' 
                              : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-600 hover:text-white'
                        }`}
                      >
                        {isAdding ? (
                          <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Added!</span>
                        ) : (
                          <>
                            <span className="text-lg font-bold mb-0.5">{isOutOfStock ? '✕' : '+'}</span>
                            <span className="text-[10px] font-black uppercase tracking-wide hidden sm:inline-block">Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300 dark:text-slate-700 animate-fadeIn">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-4xl mb-4 grayscale opacity-50">
               📦
            </div>
            <p className="text-xs font-black uppercase tracking-widest">No Products Here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryScreen;
