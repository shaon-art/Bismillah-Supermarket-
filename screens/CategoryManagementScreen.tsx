
import React, { useState } from 'react';
import { Category } from '../types';
import { TRANSLATIONS } from '../constants';

interface CategoryManagementScreenProps {
  categories: Category[];
  onBack: () => void;
  onAddCategory: (cat: Category) => void;
  onUpdateCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
  lang: 'bn' | 'en';
}

const COLOR_PRESETS = [
  'bg-emerald-100', 'bg-red-100', 'bg-orange-100', 
  'bg-blue-100', 'bg-sky-100', 'bg-amber-100', 
  'bg-purple-100', 'bg-pink-100', 'bg-indigo-100'
];

const EMOJI_PRESETS = [
  '🥬', '🍎', '🍗', '🥫', '🥛', '🍞', '🥩', '🥚', '🍵', '🍪', '🧼', '🧴', '🔋'
];

const CategoryManagementScreen: React.FC<CategoryManagementScreenProps> = ({ 
  categories, 
  onBack, 
  onAddCategory, 
  onUpdateCategory, 
  onDeleteCategory, 
  lang 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catToDelete, setCatToDelete] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    icon: '📦',
    color: 'bg-emerald-100'
  });
  
  const t = TRANSLATIONS[lang];

  const handleOpenAdd = () => {
    setEditingCat(null);
    setFormData({ name: '', icon: '📦', color: 'bg-emerald-100' });
    setShowModal(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCat(cat);
    setFormData({ ...cat });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name?.trim()) return;

    if (editingCat) {
      onUpdateCategory({ ...editingCat, ...formData } as Category);
    } else {
      onAddCategory({
        ...formData,
        id: Date.now().toString(),
      } as Category);
    }
    setShowModal(false);
  };

  const handleOpenDelete = (cat: Category) => {
    setCatToDelete(cat);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (catToDelete) {
      onDeleteCategory(catToDelete.id);
      setShowDeleteModal(false);
      setCatToDelete(null);
    }
  };

  return (
    <div className="animate-fadeIn min-h-full bg-slate-50 dark:bg-slate-950 flex flex-col pb-20 transition-colors">
      <div className="bg-slate-900 px-5 py-6 sticky top-0 z-50 shadow-xl text-white">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white active:scale-90 transition-transform">
              ←
            </button>
            <div>
              <h2 className="text-lg font-black tracking-tight">{lang === 'bn' ? 'ক্যাটাগরি ম্যানেজমেন্ট' : 'Category Manager'}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Admin Control</p>
            </div>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-green-900/20 active:scale-95 transition-all"
          >
            + {lang === 'bn' ? 'নতুন যোগ' : 'New Category'}
          </button>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 gap-3">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white dark:bg-slate-900 p-4 rounded-[28px] border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm group">
            <div className="flex items-center gap-4">
              <div className={`${cat.color} w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner`}>
                {cat.icon}
              </div>
              <div>
                <h4 className="text-[15px] font-black text-slate-800 dark:text-slate-100">{cat.name}</h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">ID: {cat.id}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleOpenEdit(cat)}
                className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center active:scale-90 transition-all"
              >
                ✏️
              </button>
              <button 
                onClick={() => handleOpenDelete(cat)}
                className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center active:scale-90 transition-all"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fadeIn bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative border border-white/10 animate-[scaleIn_0.3s_ease-out]">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6">
              {editingCat ? (lang === 'bn' ? 'ক্যাটাগরি পরিবর্তন' : 'Edit Category') : (lang === 'bn' ? 'নতুন ক্যাটাগরি' : 'New Category')}
            </h3>

            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className={`${formData.color} w-20 h-20 rounded-[28px] flex items-center justify-center text-4xl shadow-xl transition-all duration-500`}>
                  {formData.icon}
                </div>
                <div className="text-center">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{lang === 'bn' ? 'প্রিভিউ' : 'Live Preview'}</p>
                   <p className="text-xs font-black text-slate-700 dark:text-slate-300">{formData.name || (lang === 'bn' ? 'নাম নেই' : 'No Name')}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'bn' ? 'ক্যাটাগরির নাম' : 'Category Name'}</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold dark:text-white"
                  placeholder={lang === 'bn' ? 'যেমন: পানীয়' : 'e.g. Drinks'}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'bn' ? 'আইকন বেছে নিন' : 'Select Icon'}</label>
                <div className="grid grid-cols-6 gap-2">
                  {EMOJI_PRESETS.map(e => (
                    <button 
                      key={e}
                      onClick={() => setFormData({...formData, icon: e})}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${formData.icon === e ? 'bg-green-600 scale-110 shadow-lg' : 'bg-slate-100 dark:bg-slate-800'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'bn' ? 'থিম কালার' : 'Theme Color'}</label>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_PRESETS.map(c => (
                    <button 
                      key={c}
                      onClick={() => setFormData({...formData, color: c})}
                      className={`${c} w-10 h-10 rounded-xl border-2 transition-all ${formData.color === c ? 'border-green-600 scale-110' : 'border-transparent'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-xs font-black text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 rounded-2xl">{t.CANCEL}</button>
                <button onClick={handleSave} className="flex-1 py-4 text-xs font-black text-white uppercase bg-green-600 rounded-2xl shadow-lg shadow-green-100 dark:shadow-none">{lang === 'bn' ? 'সেভ করুন' : 'Save Category'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 animate-fadeIn bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-[32px] p-8 shadow-2xl relative border border-red-500/20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-4xl mb-6 animate-bounce">
              🗑️
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
              {lang === 'bn' ? 'ক্যাটাগরি মুছবেন?' : 'Delete Category?'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-8">
              {lang === 'bn' 
                ? `আপনি কি নিশ্চিত যে "${catToDelete?.name}" মুছে ফেলতে চান? এতে আপনার প্রোডাক্ট ডিলিট হবে না তবে ক্যাটাগরি হারাবে।` 
                : `Are you sure you want to delete "${catToDelete?.name}"? Your products will remain but will be uncategorized.`
              }
            </p>
            <div className="flex w-full gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="flex-1 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 rounded-2xl active:scale-95 transition-all"
              >
                {t.CANCEL}
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 py-4 text-[10px] font-black text-white uppercase tracking-widest bg-red-600 rounded-2xl shadow-xl shadow-red-900/20 active:scale-95 transition-all"
              >
                {lang === 'bn' ? 'মুছে ফেলুন' : 'Delete Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagementScreen;
