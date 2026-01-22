
import React, { useState, useEffect } from 'react';
import { Address } from '../types';

interface AddressListScreenProps {
  addresses: Address[];
  onBack: () => void;
  onAddAddress: (address: Address) => void;
  onUpdateAddress: (address: Address) => void;
  onDeleteAddress: (id: string) => void;
  onSetDefault: (id: string) => void;
}

const AddressListScreen: React.FC<AddressListScreenProps> = ({ 
  addresses, 
  onBack, 
  onAddAddress, 
  onUpdateAddress, 
  onDeleteAddress, 
  onSetDefault 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Partial<Address>>({
    label: 'Home',
    receiverName: '',
    phone: '',
    details: '',
    isDefault: false
  });

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormData({ label: 'Home', receiverName: '', phone: '', details: '', isDefault: addresses.length === 0 });
    setShowModal(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddress(addr);
    setFormData({ ...addr });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.receiverName || !formData.phone || !formData.details) return;

    if (editingAddress) {
      onUpdateAddress({
        ...editingAddress,
        ...formData
      } as Address);
    } else {
      const address: Address = {
        id: Date.now().toString(),
        label: formData.label || 'Other',
        receiverName: formData.receiverName!,
        phone: formData.phone!,
        details: formData.details!,
        isDefault: formData.isDefault || addresses.length === 0
      };
      onAddAddress(address);
    }
    setShowModal(false);
  };

  return (
    <div className="animate-fadeIn min-h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 active:scale-90 transition-transform"
          >
            ←
          </button>
          <h2 className="text-lg font-bold text-gray-900">ডেলিভারি ঠিকানা</h2>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-green-600 text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-md active:scale-95 transition-all"
        >
          নতুন যোগ করুন
        </button>
      </div>

      <div className="p-5 space-y-4">
        {addresses.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-center opacity-50 grayscale">
            <span className="text-5xl mb-4">📍</span>
            <p className="text-sm font-bold text-gray-500">আপনার কোনো ঠিকানা যোগ করা নেই।</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div 
              key={addr.id} 
              className={`bg-white rounded-3xl p-5 shadow-sm border transition-all ${
                addr.isDefault ? 'border-green-500 ring-4 ring-green-50' : 'border-gray-100'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{addr.label === 'Home' ? '🏠' : addr.label === 'Office' ? '💼' : '📍'}</span>
                  <div>
                    <h4 className="text-sm font-black text-gray-900 tracking-tight">{addr.label}</h4>
                    {addr.isDefault && <span className="text-[9px] font-black text-green-700 bg-green-50 px-2 py-0.5 rounded-full uppercase">ডিফল্ট</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                   {!addr.isDefault && (
                    <button 
                      onClick={() => onSetDefault(addr.id)}
                      className="text-[9px] font-bold text-blue-600 px-2 py-1 bg-blue-50 rounded-lg"
                    >
                      ডিফল্ট করুন
                    </button>
                  )}
                  <button 
                    onClick={() => handleOpenEdit(addr)}
                    className="text-[9px] font-bold text-amber-600 px-2 py-1 bg-amber-50 rounded-lg"
                  >
                    এডিট
                  </button>
                  <button 
                    onClick={() => onDeleteAddress(addr.id)}
                    className="text-[9px] font-bold text-red-500 px-2 py-1 bg-red-50 rounded-lg"
                  >
                    মুছুন
                  </button>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-800">{addr.receiverName}</p>
                <p className="text-xs text-gray-500 font-medium">{addr.phone}</p>
                <p className="text-xs text-gray-600 leading-relaxed mt-2">{addr.details}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Address Modal (Add/Edit) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fadeIn">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-[scaleIn_0.3s_ease-out] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-6">{editingAddress ? 'ঠিকানা পরিবর্তন করুন' : 'নতুন ঠিকানা যোগ করুন'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">ঠিকানার নাম (লেবেল)</label>
                <div className="flex gap-2">
                  {['Home', 'Office', 'Other'].map(l => (
                    <button 
                      key={l}
                      onClick={() => setFormData({...formData, label: l})}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                        formData.label === l ? 'bg-green-600 text-white border-green-600' : 'bg-gray-50 text-gray-500 border-gray-100'
                      }`}
                    >
                      {l === 'Home' ? 'বাসা' : l === 'Office' ? 'অফিস' : 'অন্যান্য'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">প্রাপকের নাম</label>
                <input 
                  type="text"
                  value={formData.receiverName}
                  onChange={(e) => setFormData({...formData, receiverName: e.target.value})}
                  placeholder="নাম লিখুন"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-green-500 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">ফোন নম্বর</label>
                <input 
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="ফোন নম্বর লিখুন"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-green-500 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">ঠিকানার বিস্তারিত</label>
                <textarea 
                  rows={3}
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                  placeholder="বাড়ি নং, রোড নং, এলাকা, জেলা..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-green-500 text-sm font-bold resize-none"
                />
              </div>

              <label className="flex items-center gap-3 p-1 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                  className="w-4 h-4 accent-green-600"
                />
                <span className="text-xs font-bold text-gray-600">ডিফল্ট ঠিকানা হিসেবে সেট করুন</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 text-xs font-bold text-gray-500 bg-gray-100 rounded-xl"
                >
                  বাতিল
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-2 px-8 py-4 text-xs font-bold text-white bg-green-600 rounded-xl shadow-lg shadow-green-100"
                >
                  {editingAddress ? 'আপডেট করুন' : 'সেভ করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default AddressListScreen;
