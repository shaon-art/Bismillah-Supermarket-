
import React, { useState, useEffect } from 'react';

interface CalculatorItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface BazarCalculatorScreenProps {
  onBack: () => void;
  lang: 'bn' | 'en';
}

const BazarCalculatorScreen: React.FC<BazarCalculatorScreenProps> = ({ onBack, lang }) => {
  const [items, setItems] = useState<CalculatorItem[]>(() => {
    const saved = localStorage.getItem('bazar_calculator_items');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');

  useEffect(() => {
    localStorage.setItem('bazar_calculator_items', JSON.stringify(items));
  }, [items]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) return;

    const item: CalculatorItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      price: parseFloat(newItemPrice),
      quantity: parseFloat(newItemQty) || 1
    };

    setItems([item, ...items]);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemQty('1');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const clearAll = () => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি সব মুছতে চান?' : 'Clear all items?')) {
      setItems([]);
    }
  };

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const currentSubtotal = (parseFloat(newItemPrice) || 0) * (parseFloat(newItemQty) || 0);

  return (
    <div className="animate-fadeIn min-h-full bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400 active:scale-90 transition-transform">
            <span className="text-xl">←</span>
          </button>
          <div>
            <h2 className="text-sm font-black text-gray-900 dark:text-white leading-none">
              {lang === 'bn' ? 'বাজার ক্যালকুলেটর' : 'Bazar Calculator'}
            </h2>
            <p className="text-[9px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest mt-1">
              {lang === 'bn' ? 'আপনার কেনাকাটার হিসাব' : 'Track your shopping'}
            </p>
          </div>
        </div>
        {items.length > 0 && (
          <button onClick={clearAll} className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg">
            {lang === 'bn' ? 'সব মুছুন' : 'Clear All'}
          </button>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4">
        <form onSubmit={handleAddItem} className="bg-white dark:bg-slate-900 p-5 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-800 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              {lang === 'bn' ? 'পণ্যের নাম' : 'Item Name'}
            </label>
            <input 
              type="text" 
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={lang === 'bn' ? 'যেমন: চাল, ডাল...' : 'e.g. Rice, Lentils...'}
              className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-green-500/20"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                {lang === 'bn' ? 'মূল্য (৳)' : 'Price (৳)'}
              </label>
              <input 
                type="number" 
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-green-500/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                {lang === 'bn' ? 'পরিমাণ' : 'Quantity'}
              </label>
              <input 
                type="number" 
                value={newItemQty}
                onChange={(e) => setNewItemQty(e.target.value)}
                placeholder="1"
                step="0.1"
                className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-green-500/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {lang === 'bn' ? 'সাবটোটাল' : 'Subtotal'}
            </p>
            <p className="text-sm font-black text-green-600 dark:text-green-400">
              ৳{currentSubtotal.toFixed(2)}
            </p>
          </div>

          <button 
            type="submit"
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 dark:shadow-none active:scale-95 transition-all"
          >
            {lang === 'bn' ? 'তালিকায় যোগ করুন' : 'Add to List'}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="flex-1 px-4 pb-40">
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 flex items-center justify-between animate-fadeIn">
              <div className="flex-1">
                <h4 className="text-sm font-black text-gray-800 dark:text-white">{item.name}</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
                  {item.quantity} x ৳{item.price} = <span className="text-green-600 dark:text-green-400">৳{item.quantity * item.price}</span>
                </p>
              </div>
              <button 
                onClick={() => removeItem(item.id)}
                className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center active:scale-90 transition-transform"
              >
                ✕
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center opacity-30">
              <span className="text-6xl mb-4">🧮</span>
              <p className="text-xs font-black uppercase tracking-widest">
                {lang === 'bn' ? 'তালিকা খালি' : 'List is empty'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Total Footer */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-100 dark:border-slate-800 z-50">
        <div className="flex items-center justify-between bg-slate-900 dark:bg-white p-5 rounded-[28px] shadow-xl">
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {lang === 'bn' ? 'মোট খরচ' : 'Total Cost'}
            </p>
            <h3 className="text-2xl font-black text-white dark:text-slate-900">
              ৳{total.toFixed(2)}
            </h3>
          </div>
          <div className="flex flex-col items-end">
            <div className="w-10 h-10 bg-white/10 dark:bg-slate-100 rounded-xl flex items-center justify-center text-xl mb-1">
              💰
            </div>
            <p className="text-[8px] font-black text-green-400 dark:text-green-600 uppercase tracking-tighter">
              {items.length} {lang === 'bn' ? 'টি পণ্য' : 'Items'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BazarCalculatorScreen;
