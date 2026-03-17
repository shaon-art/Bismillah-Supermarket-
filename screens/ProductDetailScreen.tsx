import React, { useState, useRef } from 'react';
import { Product, Review, Category, SystemSettings } from '../types';
import { TRANSLATIONS } from '../constants';

interface ProductDetailScreenProps {
  product: Product;
  isAdmin: boolean;
  categories: Category[];
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToCart: (p: Product) => void;
  onBack: () => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  lang: 'bn' | 'en';
  settings: SystemSettings;
}

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ 
  product, 
  isAdmin,
  categories,
  isFavorite, 
  onToggleFavorite, 
  onAddToCart, 
  onBack,
  onUpdateProduct,
  onDeleteProduct,
  lang,
  settings
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const t = TRANSLATIONS[lang];
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editError, setEditError] = useState('');
  const [editProd, setEditProd] = useState<Product>({ ...product });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Price Logic
  const globalDiscount = settings.globalDiscountEnabled ? settings.globalDiscountPercentage : 0;
  const displayPrice = Math.round(product.price * (1 - globalDiscount/100));
  const hasGlobalOffer = settings.globalDiscountEnabled && settings.globalDiscountPercentage > 0;
  
  const individualDiscount = product.discountPercentage || ((product.oldPrice && product.oldPrice > product.price) 
        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) 
        : 0);
  
  const shownOldPrice = hasGlobalOffer ? product.price : product.oldPrice;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRating === 0 || newComment.trim() === '') return;

    setIsSubmitting(true);
    setTimeout(() => {
      const review: Review = {
        id: Date.now().toString(),
        userName: lang === 'bn' ? 'আপনি (Guest)' : 'You (Guest)',
        rating: newRating,
        comment: newComment,
        date: lang === 'bn' ? 'এখনই' : 'Just now',
      };
      setReviews([review, ...reviews]);
      setNewRating(0);
      setNewComment('');
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handleUpdate = () => {
    // SECURITY: Reinforce that only admins can trigger the final update
    if (!isAdmin) return;

    setEditError('');
    
    const stockValue = Number(editProd.stock);
    if (!Number.isInteger(stockValue) || stockValue < 0) {
      setEditError(lang === 'bn' ? 'স্টক অবশ্যই একটি ধনাত্মক পূর্ণসংখ্যা হতে হবে' : 'Stock must be a non-negative integer');
      return;
    }

    onUpdateProduct({
      ...editProd,
      stock: stockValue
    });
    setShowEditModal(false);
  };

  const handleDelete = () => {
    if (!isAdmin) return;
    onDeleteProduct(product.id);
    setShowDeleteConfirm(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProd(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-full flex flex-col transition-colors relative">
      <div className="animate-fadeIn">
      <div className="relative h-[40vh] w-full bg-gray-50 dark:bg-slate-900">
        <img src={product.image} alt={product.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
        
        <button onClick={onBack} className="absolute top-6 left-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur w-10 h-10 rounded-full flex items-center justify-center text-gray-800 dark:text-white shadow active:scale-90 transition-all z-10">←</button>

        <div className="absolute top-6 right-6 flex flex-col gap-3 z-10">
          <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur w-10 h-10 rounded-full flex items-center justify-center shadow active:scale-90 transition-all">
            <span className={`text-xl ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}>{isFavorite ? '❤️' : '🤍'}</span>
          </button>
        </div>
        
        {hasGlobalOffer && (
           <div className="absolute bottom-4 left-6 bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-full shadow-2xl animate-bounce z-10 tracking-widest uppercase">
             Special {settings.globalDiscountPercentage}% Offer Active
           </div>
        )}
        
        {!hasGlobalOffer && individualDiscount > 0 && (
           <div className="absolute bottom-4 left-6 bg-orange-500 text-white text-[10px] font-black px-4 py-2 rounded-full shadow-2xl z-10 tracking-widest uppercase">
             {individualDiscount}% {t.OFF}
           </div>
        )}
      </div>

      <div className="flex-1 p-6 space-y-8">
        <section>
          <div className="flex items-center justify-between mb-1">
            <div className="flex gap-2">
              <span className="text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-widest border border-green-200 dark:border-green-900/30 px-2 py-0.5 rounded">{lang === 'bn' ? 'তাজা পণ্য' : 'Fresh Item'}</span>
              {!product.isActive && <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest border border-gray-200 px-2 py-0.5 rounded">Hidden</span>}
            </div>
            <div className="flex items-center text-xs font-bold text-gray-400">⭐ 4.8 ({reviews.length}+ {lang === 'bn' ? 'রিভিউ' : 'reviews'})</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{product.name}</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mt-1">{product.unit} ({lang === 'bn' ? 'স্টক' : 'Stock'}: {product.stock})</p>
          
          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-3xl font-black text-green-700 dark:text-green-400">৳{displayPrice}</span>
            {shownOldPrice && shownOldPrice > displayPrice && <span className="text-gray-300 dark:text-gray-600 line-through text-lg font-bold">৳{shownOldPrice}</span>}
          </div>
        </section>

        {/* --- ADMIN CONTROL PANEL (Only Visible to Admin) --- */}
        {isAdmin && (
          <div className="bg-blue-50 dark:bg-blue-900/10 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-2xl p-4 animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛡️</span>
                <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">{lang === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Control Panel'}</span>
              </div>
              <span className="text-[9px] font-bold text-blue-500/70 uppercase">Only Visible to You</span>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => { setEditProd({...product}); setEditError(''); setShowEditModal(true); }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>✏️</span> {lang === 'bn' ? 'এডিট ইনফরমেশন' : 'Edit Full Details'}
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-12 bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 py-3 rounded-xl text-lg flex items-center justify-center active:scale-95 transition-all border border-red-200 dark:border-red-900/50"
              >
                🗑️
              </button>
            </div>
          </div>
        )}

        <section className="space-y-2 border-t dark:border-slate-800 pt-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">{lang === 'bn' ? 'পণ্যের বিবরণ' : 'Product Details'}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{product.description}</p>
        </section>

        <div className="grid grid-cols-3 gap-3 border-t dark:border-slate-800 pt-5">
          <DetailIcon icon="🚚" label={lang === 'bn' ? "আজই ডেলিভারি" : "Same day delivery"} />
          <DetailIcon icon="🛡️" label={lang === 'bn' ? "নিরাপদ খাদ্য" : "Safe Food"} />
          <DetailIcon icon="💵" label={lang === 'bn' ? "পেমেন্ট অন ডেলি" : "Cash on Delivery"} />
        </div>

        <section className="space-y-6 border-t dark:border-slate-800 pt-8 pb-10">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">{lang === 'bn' ? 'কাস্টমার রিভিউ' : 'Customer Reviews'} ({reviews.length})</h3>
            <div className="flex text-orange-400 text-xs">{'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}</div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 transition-colors">
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-tight">{lang === 'bn' ? 'আপনার মতামত দিন' : 'Write a Review'}</h4>
            {showSuccess && <div className="mb-4 bg-green-100 text-green-700 text-[10px] font-bold py-2 px-3 rounded-lg text-center">{lang === 'bn' ? 'ধন্যবাদ! আপনার রিভিউটি যুক্ত হয়েছে।' : 'Thank you! Your review has been added.'}</div>}
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setNewRating(star)} className={`text-2xl transition-all ${star <= newRating ? 'text-orange-400 scale-110' : 'text-gray-300 dark:text-gray-600'}`}>★</button>
                ))}
              </div>
              <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={lang === 'bn' ? "পণ্যটি সম্পর্কে আপনার অভিজ্ঞতা লিখুন..." : "Describe your experience..."} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all min-h-[80px] resize-none dark:text-white" />
              <button type="submit" disabled={isSubmitting || newRating === 0 || !newComment.trim()} className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all ${isSubmitting || newRating === 0 || !newComment.trim() ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white shadow-md active:scale-95'}`}>{isSubmitting ? (lang === 'bn' ? 'সাবমিট হচ্ছে...' : 'Submitting...') : (lang === 'bn' ? 'রিভিউ সাবমিট করুন' : 'Submit Review')}</button>
            </form>
          </div>

          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-50 dark:border-slate-800 shadow-sm transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-xs font-bold text-green-700 dark:text-green-400">{review.userName.charAt(0)}</div>
                    <div>
                      <h5 className="text-[11px] font-bold text-gray-900 dark:text-white">{review.userName}</h5>
                      <div className="flex text-orange-400 text-[10px]">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-400 font-bold">{review.date}</span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{review.comment}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="p-5 border-t dark:border-slate-800 bg-white dark:bg-slate-950 sticky bottom-0 z-20 transition-colors">
        <button onClick={() => { onAddToCart(product); onBack(); }} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-base shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2">
          <span className="text-xl">🛒</span>
          <span>{t.ADD_TO_CART}</span>
        </button>
      </div>
      </div>

      {isAdmin && showEditModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative transition-colors my-auto border border-white/10 animate-scaleIn">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{lang === 'bn' ? 'পণ্য তথ্য পরিবর্তন করুন' : 'Edit Product'}</h3>
            <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
              <div className="flex flex-col items-center gap-3">
                 <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-32 h-32 rounded-2xl bg-gray-100 dark:bg-slate-800 border-2 border-dashed border-gray-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                      <img src={editProd.image} alt="preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-opacity"><span className="text-white text-[10px] font-black uppercase tracking-widest">{lang === 'bn' ? 'ছবি পরিবর্তন' : 'Change Image'}</span></div>
                 </div>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
              </div>
              <input type="text" value={editProd.name} onChange={e => setEditProd(prev => ({...prev, name: e.target.value}))} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 outline-none text-sm font-bold dark:text-white" />
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                <span className="text-xs font-bold dark:text-white">{lang === 'bn' ? 'পণ্যটি কি লাইভ থাকবে?' : 'Active Status'}</span>
                <button 
                  onClick={() => setEditProd(prev => ({...prev, isActive: !prev.isActive}))}
                  className={`w-12 h-6 rounded-full relative transition-colors ${editProd.isActive ? 'bg-green-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editProd.isActive ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{lang === 'bn' ? 'মূল্য' : 'Price'}</label>
                  <input type="number" value={editProd.price} onChange={e => setEditProd(prev => ({...prev, price: Number(e.target.value)}))} className="w-full px-3 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 outline-none text-xs font-bold dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{lang === 'bn' ? 'পুরাতন' : 'Old'}</label>
                  <input type="number" value={editProd.oldPrice || 0} onChange={e => setEditProd(prev => ({...prev, oldPrice: Number(e.target.value)}))} className="w-full px-3 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 outline-none text-xs font-bold dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest ml-1">Disc%</label>
                  <input type="number" value={editProd.discountPercentage || 0} onChange={e => setEditProd(prev => ({...prev, discountPercentage: Number(e.target.value)}))} className="w-full px-3 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 outline-none text-xs font-black text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <select value={editProd.category} onChange={e => setEditProd(prev => ({...prev, category: e.target.value}))} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 outline-none text-sm font-bold dark:text-white">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{lang === 'bn' ? 'ইউনিট' : 'Unit'}</label>
                  <input type="text" value={editProd.unit} onChange={e => setEditProd(prev => ({...prev, unit: e.target.value}))} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 outline-none text-sm font-bold dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{lang === 'bn' ? 'স্টক' : 'Stock'}</label>
                  <input type="number" value={editProd.stock} onChange={e => setEditProd(prev => ({...prev, stock: Number(e.target.value)}))} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 outline-none text-sm font-bold dark:text-white" />
                </div>
              </div>
              <textarea value={editProd.description} onChange={e => setEditProd(prev => ({...prev, description: e.target.value}))} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 outline-none text-sm resize-none dark:text-white" rows={3} />
              
              {editError && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 animate-fadeIn">
                  <p className="text-[11px] font-bold text-red-500 text-center">⚠️ {editError}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowEditModal(false); setEditError(''); }} className="flex-1 py-3 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-slate-800 rounded-xl">{t.CANCEL}</button>
              <button onClick={handleUpdate} className="flex-1 py-3 text-xs font-bold text-white bg-green-600 rounded-xl">{lang === 'bn' ? 'আপডেট করুন' : 'Update'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isAdmin && showDeleteConfirm && (
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
                ? `আপনি কি নিশ্চিত যে "${product.name}" চিরতরে মুছে ফেলতে চান?` 
                : `Are you sure you want to permanently delete "${product.name}"?`
              }
            </p>
            <div className="flex w-full gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="flex-1 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 rounded-2xl active:scale-95 transition-all"
              >
                {t.CANCEL}
              </button>
              <button 
                onClick={handleDelete} 
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

const DetailIcon: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <div className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 dark:bg-slate-900 rounded-xl transition-colors">
    <span className="text-xl">{icon}</span>
    <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 text-center uppercase tracking-tight leading-none">{label}</span>
  </div>
);

export default ProductDetailScreen;