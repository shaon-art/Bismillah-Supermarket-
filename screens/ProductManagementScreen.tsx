import React, { useState, useMemo, useRef } from 'react';
import { Product, Category, Screen, SystemSettings } from '../types';
import { TRANSLATIONS } from '../constants';
import { uploadToImgBB } from '../utils/imgbb';
import { uploadToFirebase } from '../utils/firebaseStorage';

interface ProductManagementScreenProps {
  products: Product[];
  categories: Category[];
  settings: SystemSettings;
  onBack: () => void;
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onNavigate: (screen: Screen) => void;
  onSeedProducts: () => void;
  lang: 'bn' | 'en';
}

const ProductManagementScreen: React.FC<ProductManagementScreenProps> = ({ 
  products, 
  categories, 
  settings,
  onBack, 
  onAddProduct,
  onUpdateProduct, 
  onDeleteProduct,
  onNavigate,
  onSeedProducts,
  lang 
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'ALL' | 'OUT_OF_STOCK' | 'HIDDEN'>('ALL');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Discount State
  const [discountPercent, setDiscountPercent] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = (TRANSLATIONS as any)[lang] || TRANSLATIONS.bn;

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    oldPrice: 0,
    discountPercentage: 0,
    category: (categories && categories.length > 0) ? categories[0].id : '1',
    unit: lang === 'bn' ? '১ কেজি' : '1 kg',
    stock: 0,
    description: '',
    isActive: true,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'
  });

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCat === 'all' || p.category === selectedCat;
      
      let matchesFilter = true;
      if (filterMode === 'OUT_OF_STOCK') matchesFilter = p.stock === 0;
      if (filterMode === 'HIDDEN') matchesFilter = !p.isActive;
      
      return matchesSearch && matchesCat && matchesFilter;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [products, search, selectedCat, filterMode]);

  const stats = useMemo(() => {
    return {
      total: products.length,
      active: products.filter(p => p.isActive).length,
      hidden: products.filter(p => !p.isActive).length,
      outOfStock: products.filter(p => p.stock === 0).length,
    };
  }, [products]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: 0,
      oldPrice: 0,
      discountPercentage: 0,
      category: categories[0]?.id || '1',
      unit: lang === 'bn' ? '১ কেজি' : '1 kg',
      stock: 100,
      description: '',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'
    });
    setDiscountPercent('');
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    if (!p) return;
    setEditingProduct(p);
    setFormData({ ...p });
    
    let dp = '';
    if (p.discountPercentage !== undefined && p.discountPercentage !== null && p.discountPercentage > 0) {
      dp = String(p.discountPercentage);
    } else if (p.oldPrice && p.oldPrice > p.price) {
      const d = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
      dp = d.toString();
    }
    setDiscountPercent(dp);
    
    setError('');
    setShowModal(true);
  };

  const handlePriceChange = (field: 'price' | 'oldPrice' | 'discount', value: string) => {
    const valNum = parseFloat(value);
    
    if (field === 'discount') {
        setDiscountPercent(value);
        if (value === '' || isNaN(valNum)) {
            setFormData(prev => ({ ...prev, discountPercentage: 0 }));
            return;
        }
        
        let basePrice = formData.oldPrice || 0;
        
        // If Old Price is not set, assume current Price is Base Price
        if (basePrice === 0) {
            basePrice = formData.price || 0;
            // Optimistically update oldPrice
            setFormData(prev => ({ ...prev, oldPrice: basePrice }));
        }

        if (basePrice > 0) {
            const newPrice = Math.round(basePrice * (1 - valNum / 100));
            setFormData(prev => ({ ...prev, price: newPrice, oldPrice: basePrice, discountPercentage: valNum }));
        } else {
            setFormData(prev => ({ ...prev, discountPercentage: valNum }));
        }
    } else if (field === 'oldPrice') {
        const newMrp = isNaN(valNum) ? 0 : valNum;
        const disc = parseFloat(discountPercent);
        
        let newPrice = formData.price;
        // Recalc price if discount exists
        if (!isNaN(disc) && disc > 0 && newMrp > 0) {
            newPrice = Math.round(newMrp * (1 - disc / 100));
        } else if (newMrp > 0 && (!formData.price || formData.price === 0)) {
            newPrice = newMrp;
        }
        
        setFormData(prev => ({ ...prev, oldPrice: newMrp, price: newPrice, discountPercentage: isNaN(disc) ? 0 : disc }));
    } else if (field === 'price') {
        const newPrice = isNaN(valNum) ? 0 : valNum;
        
        // Reverse calc discount % if MRP exists
        const mrp = formData.oldPrice || 0;
        let newDisc = 0;
        if (mrp > newPrice && newPrice > 0) {
            newDisc = Math.round(((mrp - newPrice) / mrp) * 100);
            setDiscountPercent(newDisc.toString());
        } else {
            setDiscountPercent('');
        }
        setFormData(prev => ({ ...prev, price: newPrice, discountPercentage: newDisc }));
    }
  };

  const handleOpenDelete = (p: Product) => {
    setProductToDelete(p);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      onDeleteProduct(productToDelete.id);
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setError('');
      try {
        let imageUrl = '';
        if (settings.preferredStorage === 'FIREBASE') {
          const path = `products/${Date.now()}_${file.name}`;
          imageUrl = await uploadToFirebase(file, path);
        } else {
          imageUrl = await uploadToImgBB(file);
        }
        setFormData(prev => ({ ...prev, image: imageUrl }));
      } catch (err) {
        console.error("Image upload failed:", err);
        setError(lang === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Image upload failed');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = () => {
    if (!formData.name?.trim()) {
      setError(lang === 'bn' ? 'পণ্যের নাম দিন' : 'Enter product name');
      return;
    }
    if ((formData.price || 0) <= 0) {
      setError(lang === 'bn' ? 'সঠিক মূল্য দিন' : 'Enter a valid price');
      return;
    }

    if (editingProduct) {
      onUpdateProduct(formData as Product);
    } else {
      onAddProduct({
        ...formData,
        id: 'p-' + Date.now(),
      } as Product);
    }
    setShowModal(false);
  };

  const toggleProductActive = (product: Product) => {
    onUpdateProduct({ ...product, isActive: !product.isActive });
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 flex flex-col pb-24 transition-colors relative">
      <div className="animate-fadeIn">
        {/* Admin Header */}
        <div className="bg-slate-900 px-5 py-6 sticky top-0 z-50 shadow-lg text-white">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white active:scale-90 transition-transform">
              ←
            </button>
            <div>
              <h2 className="text-lg font-black tracking-tight">{lang === 'bn' ? 'পণ্য ব্যবস্থাপনা' : 'Product Inventory'}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Admin Control</p>
            </div>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-green-900/20 active:scale-95 transition-all"
          >
            + {lang === 'bn' ? 'নতুন পণ্য' : 'New Product'}
          </button>
          <button 
            onClick={onSeedProducts}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-purple-900/20 active:scale-95 transition-all ml-2"
          >
            🌱 {lang === 'bn' ? 'ডামি' : 'Seed'}
          </button>
        </div>

        {/* Inventory Stats Bar */}
        <div className="grid grid-cols-4 gap-2">
          <StatCard label={lang === 'bn' ? 'মোট' : 'Total'} value={stats.total} color="bg-blue-500/10" textColor="text-blue-400" />
          <StatCard label={lang === 'bn' ? 'লাইভ' : 'Live'} value={stats.active} color="bg-green-500/10" textColor="text-green-400" />
          <StatCard label={lang === 'bn' ? 'লুকানো' : 'Hidden'} value={stats.hidden} color="bg-gray-500/10" textColor="text-gray-400" />
          <StatCard label={lang === 'bn' ? 'খালি' : 'Empty'} value={stats.outOfStock} color="bg-red-500/10" textColor="text-red-400" />
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="px-4 mt-4">
         <button 
            onClick={() => onNavigate('ADMIN_CONTROL')}
            className="w-full bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 p-3 rounded-2xl border border-orange-200 dark:border-orange-800/30 flex items-center justify-between group active:scale-95 transition-all"
         >
            <div className="flex items-center gap-3">
               <span className="text-xl">🏷️</span>
               <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'bn' ? 'সব পণ্যে ছাড় দিতে ড্যাশবোর্ডে যান' : 'Set Bulk Discounts via Dashboard'}</span>
            </div>
            <span className="text-sm font-bold group-hover:translate-x-1 transition-transform">❯</span>
         </button>
      </div>

      {/* Search & Filters */}
      <div className="p-4 space-y-4">
        <div className="relative group">
          <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder={lang === 'bn' ? 'পণ্য খুঁজুন...' : 'Search items...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all outline-none dark:text-white font-bold"
          />
        </div>

        <div className="flex gap-2 pb-1">
          <FilterButton 
             active={filterMode === 'ALL'} 
             label={lang === 'bn' ? 'সব' : 'All'} 
             onClick={() => setFilterMode('ALL')} 
          />
          <FilterButton 
             active={filterMode === 'OUT_OF_STOCK'} 
             label={lang === 'bn' ? 'স্টক নেই' : 'Empty'} 
             onClick={() => setFilterMode('OUT_OF_STOCK')} 
          />
          <FilterButton 
             active={filterMode === 'HIDDEN'} 
             label={lang === 'bn' ? 'লুকানো' : 'Hidden'} 
             onClick={() => setFilterMode('HIDDEN')} 
          />
        </div>

        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar border-t border-slate-100 dark:border-slate-800 pt-4">
          <button 
            onClick={() => setSelectedCat('all')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              selectedCat === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'
            }`}
          >
            {lang === 'bn' ? 'সব ক্যাটাগরি' : 'All Categories'}
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                selectedCat === cat.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Management List */}
      <div className="px-4 space-y-3">
        {filteredProducts.map(p => (
          <div 
            key={p.id} 
            className={`bg-white dark:bg-slate-900 rounded-[24px] p-4 flex gap-4 border border-slate-100 dark:border-slate-800 shadow-sm transition-all group ${!p.isActive ? 'opacity-70 grayscale-[0.3]' : ''}`}
          >
            <div className="relative w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden shrink-0">
              <img src={p.image} className="w-full h-full object-cover" alt={p.name} referrerPolicy="no-referrer" />
              {p.stock === 0 && (
                <div className="absolute inset-0 bg-red-600/60 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-[8px] font-black text-white uppercase tracking-tighter">Out of Stock</span>
                </div>
              )}
              {!p.isActive && (
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                  <span className="text-[8px] font-black text-white uppercase tracking-tighter">Hidden</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h4 className="text-[13px] font-black text-slate-800 dark:text-slate-100 truncate pr-2">{p.name}</h4>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleOpenEdit(p)}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-xl active:scale-90"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleOpenDelete(p)}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-xl active:scale-90"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[12px] font-black text-blue-600 dark:text-blue-400">৳{p.price}</span>
                  {p.oldPrice && p.oldPrice > p.price && (
                     <span className="text-[10px] text-slate-400 line-through font-bold">৳{p.oldPrice}</span>
                  )}
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">/ {p.unit}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleProductActive(p)}
                    className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                      p.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}
                  >
                    {p.isActive ? 'Live' : 'Hidden'}
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
                  <button 
                    onClick={() => onUpdateProduct({ ...p, stock: Math.max(0, p.stock - 1) })}
                    className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-500 font-black"
                  >
                    −
                  </button>
                  <span className="text-[10px] font-black w-6 text-center dark:text-white">{p.stock}</span>
                  <button 
                    onClick={() => onUpdateProduct({ ...p, stock: p.stock + 1 })}
                    className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-green-600 font-black"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-300 opacity-50 grayscale">
            <span className="text-6xl mb-4">🥫</span>
            <p className="font-black uppercase tracking-widest text-xs">{lang === 'bn' ? 'পণ্য পাওয়া যায়নি' : 'No Products Found'}</p>
          </div>
        )}
      </div>
      </div>

      {/* Unified Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative my-auto border border-white/10 animate-scaleIn">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">
              {editingProduct 
                ? (lang === 'bn' ? 'পণ্য পরিবর্তন' : 'Edit Product') 
                : (lang === 'bn' ? 'নতুন পণ্য যোগ' : 'Add New Product')
              }
            </h3>
            
            <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
              {/* Image Preview & Upload */}
              <div className="flex flex-col items-center gap-3">
                 <div className="relative group cursor-pointer" onClick={() => !isUploading && fileInputRef.current?.click()}>
                    <div className={`w-28 h-28 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center ${isUploading ? 'opacity-50' : ''}`}>
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-[8px] font-black uppercase text-slate-400">Uploading...</span>
                        </div>
                      ) : (
                        <img src={formData.image} alt="preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      )}
                    </div>
                    {!isUploading && (
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 rounded-3xl flex items-center justify-center transition-opacity">
                        <span className="text-white text-[9px] font-black uppercase tracking-widest">{lang === 'bn' ? 'ছবি বদলান' : 'Change Image'}</span>
                      </div>
                    )}
                 </div>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} disabled={isUploading} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{lang === 'bn' ? 'পণ্যের নাম' : 'Product Name'}</label>
                <input 
                  type="text" 
                  value={formData.name || ''} 
                  onChange={e => setFormData(prev => ({...prev, name: e.target.value}))} 
                  placeholder={lang === 'bn' ? 'যেমন: ফ্রেশ আপেল' : 'e.g. Fresh Apple'}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 outline-none text-sm font-bold dark:text-white focus:ring-2 focus:ring-green-500/20" 
                />
              </div>

              {/* Advanced Pricing Section with Discount */}
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 border-b border-slate-200 dark:border-slate-700 pb-1">Pricing Strategy</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{lang === 'bn' ? 'বাজার মূল্য' : 'Regular'}</label>
                    <input 
                      type="number" 
                      value={formData.oldPrice || ''} 
                      onChange={e => handlePriceChange('oldPrice', e.target.value)}
                      placeholder="MRP"
                      className="w-full px-2 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 outline-none text-xs font-bold dark:text-white text-center" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest ml-1 text-center block">Discount %</label>
                    <input 
                      type="number" 
                      value={discountPercent} 
                      onChange={e => handlePriceChange('discount', e.target.value)}
                      placeholder="0%"
                      className="w-full px-2 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 outline-none text-xs font-black text-blue-600 dark:text-blue-400 text-center focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-green-600 uppercase tracking-widest ml-1">{lang === 'bn' ? 'বিক্রয় মূল্য' : 'Sale Price'}</label>
                    <input 
                      type="number" 
                      value={formData.price || ''} 
                      onChange={e => handlePriceChange('price', e.target.value)} 
                      placeholder="Sale"
                      className="w-full px-2 py-2.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-green-500 dark:border-green-600 outline-none text-xs font-black text-green-700 dark:text-green-400 text-center" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}</label>
                  <select 
                    value={formData.category || ''} 
                    onChange={e => setFormData(prev => ({...prev, category: e.target.value}))} 
                    className="w-full px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 outline-none text-xs font-bold dark:text-white"
                  >
                    {(categories || []).map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{lang === 'bn' ? 'ইউনিট' : 'Unit'}</label>
                  <input 
                    type="text" 
                    value={formData.unit || ''} 
                    onChange={e => setFormData(prev => ({...prev, unit: e.target.value}))} 
                    placeholder="১ কেজি"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 outline-none text-sm font-bold dark:text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{lang === 'bn' ? 'স্টক পরিমাণ' : 'Stock Qty'}</label>
                  <input 
                    type="number" 
                    value={formData.stock || ''} 
                    onChange={e => setFormData(prev => ({...prev, stock: Number(e.target.value)}))} 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 outline-none text-sm font-bold dark:text-white" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{lang === 'bn' ? 'অবস্থা' : 'Status'}</label>
                  <button 
                    onClick={() => setFormData(prev => ({...prev, isActive: !prev.isActive}))}
                    className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      formData.isActive ? 'bg-green-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {formData.isActive ? 'Live' : 'Hidden'}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{lang === 'bn' ? 'বিস্তারিত বিবরণ' : 'Description'}</label>
                <textarea 
                  value={formData.description || ''} 
                  onChange={e => setFormData(prev => ({...prev, description: e.target.value}))} 
                  placeholder={lang === 'bn' ? 'পণ্য সম্পর্কে কিছু লিখুন...' : 'Enter details...'}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 outline-none text-xs font-medium dark:text-white resize-none" 
                  rows={3} 
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl p-3 animate-fadeIn">
                  <p className="text-[11px] font-bold text-red-500 text-center">⚠️ {error}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowModal(false)} 
                className="flex-1 py-4 text-xs font-black text-gray-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 rounded-2xl active:scale-95 transition-all"
              >
                {t.CANCEL}
              </button>
              <button 
                onClick={handleSave} 
                className="flex-1 py-4 text-xs font-black text-white uppercase tracking-widest bg-green-600 rounded-2xl shadow-xl shadow-green-900/20 active:scale-95 transition-all"
              >
                {lang === 'bn' ? 'সেভ করুন' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-[32px] p-8 shadow-2xl relative border border-red-500/20 flex flex-col items-center text-center animate-scaleIn">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-4xl mb-6 animate-bounce">
              🗑️
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
              {lang === 'bn' ? 'পণ্য মুছে ফেলবেন?' : 'Delete Product?'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-8">
              {lang === 'bn' 
                ? `আপনি কি নিশ্চিত যে "${productToDelete?.name}" চিরতরে মুছে ফেলতে চান?` 
                : `Are you sure you want to permanently delete "${productToDelete?.name}"?`
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

const StatCard: React.FC<{ label: string; value: number; color: string; textColor?: string }> = ({ label, value, color, textColor = 'text-white' }) => (
  <div className={`${color} p-3 rounded-2xl border border-white/5 backdrop-blur-sm flex flex-col items-center justify-center`}>
    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-sm font-black ${textColor}`}>{value}</p>
  </div>
);

const FilterButton: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({ active, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
       active ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'
    }`}
  >
    {label}
  </button>
);

export default ProductManagementScreen;