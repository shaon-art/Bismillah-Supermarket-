
import React, { useState } from 'react';
import { Coupon, SpecialOffer } from '../types';

interface CouponManagementScreenProps {
  coupons: Coupon[];
  specialOffers: SpecialOffer[];
  onBack: () => void;
  onAddCoupon: (coupon: Coupon) => void;
  onUpdateCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (id: string) => void;
  onAddSpecialOffer: (offer: SpecialOffer) => void;
  onUpdateSpecialOffer: (offer: SpecialOffer) => void;
  onDeleteSpecialOffer: (id: string) => void;
  lang: 'bn' | 'en';
}

const CouponManagementScreen: React.FC<CouponManagementScreenProps> = ({
  coupons,
  specialOffers,
  onBack,
  onAddCoupon,
  onUpdateCoupon,
  onDeleteCoupon,
  onAddSpecialOffer,
  onUpdateSpecialOffer,
  onDeleteSpecialOffer,
  lang
}) => {
  const [activeTab, setActiveTab] = useState<'COUPONS' | 'OFFERS'>('COUPONS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null);

  const [formData, setFormData] = useState<any>({});

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setEditingOffer(null);
    if (activeTab === 'COUPONS') {
      setFormData({
        id: 'c_' + Date.now(),
        code: '',
        discount: '',
        description: '',
        expiry: '',
        icon: '🎟️',
        color: 'bg-emerald-500',
        isActive: true,
        discountType: 'PERCENTAGE',
        discountValue: 0,
        minOrderAmount: 0
      });
    } else {
      setFormData({
        id: 'o_' + Date.now(),
        title: '',
        description: '',
        icon: '🎁',
        color: 'bg-orange-500',
        isActive: true,
        actionText: lang === 'bn' ? 'অফারটি নিন' : 'Get Offer',
        actionLink: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    if (activeTab === 'COUPONS') {
      setEditingCoupon(item);
      setFormData(item);
    } else {
      setEditingOffer(item);
      setFormData(item);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'COUPONS') {
      if (editingCoupon) onUpdateCoupon(formData);
      else onAddCoupon(formData);
    } else {
      if (editingOffer) onUpdateSpecialOffer(formData);
      else onAddSpecialOffer(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-full bg-slate-950 text-white flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white active:scale-90 transition-transform">
            ←
          </button>
          <div>
            <h2 className="text-lg font-black tracking-tight">{lang === 'bn' ? 'কুপন ও অফার ব্যবস্থাপনা' : 'Coupons & Offers'}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Admin Control</p>
          </div>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-green-900/20 active:scale-95 transition-all"
        >
          + {lang === 'bn' ? 'নতুন যোগ করুন' : 'Add New'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-4 gap-2">
        <button 
          onClick={() => setActiveTab('COUPONS')}
          className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === 'COUPONS' ? 'bg-white text-slate-950 shadow-xl' : 'bg-white/5 text-slate-400'}`}
        >
          {lang === 'bn' ? 'কুপনসমূহ' : 'Coupons'}
        </button>
        <button 
          onClick={() => setActiveTab('OFFERS')}
          className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === 'OFFERS' ? 'bg-white text-slate-950 shadow-xl' : 'bg-white/5 text-slate-400'}`}
        >
          {lang === 'bn' ? 'স্পেশাল অফার' : 'Special Offers'}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {activeTab === 'COUPONS' ? (
          coupons.map(coupon => (
            <div key={coupon.id} className="bg-slate-900 border border-white/5 rounded-3xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl">{coupon.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm">{coupon.code}</h3>
                  {!coupon.isActive && <span className="text-[8px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded-full font-bold uppercase">Inactive</span>}
                </div>
                <p className="text-[10px] text-slate-400 font-bold">{coupon.discount} • {coupon.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(coupon)} className="p-2 bg-white/5 rounded-xl text-blue-400">✎</button>
                <button onClick={() => onDeleteCoupon(coupon.id)} className="p-2 bg-white/5 rounded-xl text-red-400">✕</button>
              </div>
            </div>
          ))
        ) : (
          specialOffers.map(offer => (
            <div key={offer.id} className="bg-slate-900 border border-white/5 rounded-3xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl">{offer.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm">{offer.title}</h3>
                  {!offer.isActive && <span className="text-[8px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded-full font-bold uppercase">Inactive</span>}
                </div>
                <p className="text-[10px] text-slate-400 font-bold">{offer.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(offer)} className="p-2 bg-white/5 rounded-xl text-blue-400">✎</button>
                <button onClick={() => onDeleteSpecialOffer(offer.id)} className="p-2 bg-white/5 rounded-xl text-red-400">✕</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[40px] p-8 shadow-2xl animate-scaleIn">
            <h3 className="text-xl font-black mb-6">
              {editingCoupon || editingOffer ? (lang === 'bn' ? 'এডিট করুন' : 'Edit') : (lang === 'bn' ? 'নতুন যোগ করুন' : 'Add New')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'COUPONS' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Coupon Code</label>
                      <input 
                        type="text" 
                        value={formData.code}
                        onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                        className="w-full bg-slate-800 border border-white/5 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500"
                        placeholder="SAVE10"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Discount Label</label>
                      <input 
                        type="text" 
                        value={formData.discount}
                        onChange={e => setFormData({...formData, discount: e.target.value})}
                        className="w-full bg-slate-800 border border-white/5 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500"
                        placeholder="১০% ছাড়"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Description</label>
                    <textarea 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-slate-800 border border-white/5 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500 h-20"
                      placeholder="৫০০ টাকার বেশি অর্ডারে ছাড়"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Type</label>
                      <select 
                        value={formData.discountType}
                        onChange={e => setFormData({...formData, discountType: e.target.value})}
                        className="w-full bg-slate-800 border border-white/5 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500"
                      >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FIXED">Fixed Amount (৳)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Value</label>
                      <input 
                        type="number" 
                        value={formData.discountValue}
                        onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})}
                        className="w-full bg-slate-800 border border-white/5 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Min Order</label>
                      <input 
                        type="number" 
                        value={formData.minOrderAmount}
                        onChange={e => setFormData({...formData, minOrderAmount: Number(e.target.value)})}
                        className="w-full bg-slate-800 border border-white/5 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Expiry</label>
                      <input 
                        type="text" 
                        value={formData.expiry}
                        onChange={e => setFormData({...formData, expiry: e.target.value})}
                        className="w-full bg-slate-800 border border-white/5 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500"
                        placeholder="৩০ জুন, ২০২৪"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Title</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-slate-800 border border-white/5 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500"
                      placeholder="Buy 1 Get 1 Free!"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Description</label>
                    <textarea 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-slate-800 border border-white/5 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500 h-20"
                      placeholder="অফারের বিস্তারিত লিখুন"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Icon (Emoji)</label>
                      <input 
                        type="text" 
                        value={formData.icon}
                        onChange={e => setFormData({...formData, icon: e.target.value})}
                        className="w-full bg-slate-800 border border-white/5 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500 text-center text-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Action Text</label>
                      <input 
                        type="text" 
                        value={formData.actionText}
                        onChange={e => setFormData({...formData, actionText: e.target.value})}
                        className="w-full bg-slate-800 border border-white/5 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500"
                        placeholder="অফারটি নিন"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 py-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="w-5 h-5 rounded-lg accent-green-600"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-slate-300">Active / Visible</label>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl bg-white/5 text-slate-400 font-black text-xs active:scale-95 transition-all"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-green-600 text-white font-black text-xs shadow-xl shadow-green-900/20 active:scale-95 transition-all"
                >
                  {lang === 'bn' ? 'সেভ করুন' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagementScreen;
