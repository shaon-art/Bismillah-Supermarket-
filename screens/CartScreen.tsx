import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { CartItem, PaymentMethod, Address } from '../types';

interface CartScreenProps {
  cart: CartItem[];
  addresses: Address[];
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (method: PaymentMethod, details?: { phone?: string, trxId?: string }, address?: Address) => void;
  onManageAddresses: () => void;
  lang: 'bn' | 'en';
  isStoreOpen: boolean;
  deliveryCharge: number;
  supportPhone: string;
}

const CartScreen: React.FC<CartScreenProps> = ({ 
  cart, 
  addresses, 
  onUpdateQty, 
  onRemove, 
  onClearCart, 
  onPlaceOrder, 
  onManageAddresses, 
  lang,
  isStoreOpen,
  deliveryCharge,
  supportPhone
}) => {
  const [isCheckoutView, setIsCheckoutView] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('COD');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const t = TRANSLATIONS[lang];
  
  const BKASH_NUMBER = '01978501415';
  const NAGAD_NUMBER = '01978501415';
  const currentPaymentNumber = selectedMethod === 'BKASH' ? BKASH_NUMBER : NAGAD_NUMBER;

  const [selectedAddrId, setSelectedAddrId] = useState(addresses.find(a => a.isDefault)?.id || addresses[0]?.id || '');

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const selectedAddress = addresses.find(a => a.id === selectedAddrId);

  const handleCheckout = () => {
    if (!isStoreOpen) {
      alert(lang === 'bn' ? 'দুঃখিত, বর্তমানে দোকান বন্ধ রয়েছে।' : 'Sorry, the store is currently closed.');
      return;
    }

    // --- WhatsApp Notification Logic (Updated Format) ---
    const itemsList = cart.map((item, index) => 
      `${index + 1}. ${item.name} (${item.quantity} ${item.unit}) = ৳${item.price * item.quantity}`
    ).join('\n');

    const subTotal = total;
    const totalAmount = total + deliveryCharge;
    const dateStr = new Date().toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US');
    
    // Format Payment Details
    const paymentDetailsInfo = selectedMethod === 'COD' 
      ? (lang === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash On Delivery')
      : `${selectedMethod}\nPhone: ${paymentPhone}\nTrxID: ${trxId}`;

    // Format message based on language
    const message = lang === 'bn' 
      ? `🛒 *নতুন অর্ডার অ্যালার্ট!*
📅 সময়: ${dateStr}

👤 *ক্রেতার তথ্য:*
নাম: ${selectedAddress?.receiverName}
ফোন: ${selectedAddress?.phone}
ঠিকানা: ${selectedAddress?.details}
লোকেশন: ${selectedAddress?.label}

🛍️ *অর্ডারের তালিকা:*
${itemsList}

----------------------------
💰 পণ্যের দাম: ৳${subTotal}
🚚 ডেলিভারি চার্জ: ৳${deliveryCharge}
💵 *সর্বমোট বিল: ৳${totalAmount}*
----------------------------

💳 *পেমেন্ট মেথড:*
${paymentDetailsInfo}

[অ্যাপ থেকে অটো-জেনারেটেড]`
      : `🛒 *New Order Alert!*
📅 Time: ${dateStr}

👤 *Customer Info:*
Name: ${selectedAddress?.receiverName}
Phone: ${selectedAddress?.phone}
Address: ${selectedAddress?.details}
Type: ${selectedAddress?.label}

🛍️ *Order Items:*
${itemsList}

----------------------------
💰 Subtotal: ৳${subTotal}
🚚 Delivery: ৳${deliveryCharge}
💵 *Grand Total: ৳${totalAmount}*
----------------------------

💳 *Payment Method:*
${paymentDetailsInfo}

[Auto-generated from App]`;

    // Format phone number (remove 0 from start if exists, add 880)
    let fmtPhone = supportPhone.replace(/\D/g, '');
    if (fmtPhone.startsWith('0')) fmtPhone = '88' + fmtPhone;
    else if (!fmtPhone.startsWith('88')) fmtPhone = '880' + fmtPhone;

    // Open WhatsApp
    const waLink = `https://wa.me/${fmtPhone}?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');

    // Proceed with app logic
    setIsPlacingOrder(true);
    setTimeout(() => {
      onPlaceOrder(
        selectedMethod, 
        selectedMethod !== 'COD' ? { phone: paymentPhone, trxId } : undefined,
        selectedAddress
      );
      setIsPlacingOrder(false);
      setIsCheckoutView(false);
    }, 1500);
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(currentPaymentNumber);
    setShowCopyTooltip(true);
    setTimeout(() => setShowCopyTooltip(false), 2000);
  };

  const isPaymentValid = () => {
    if (!selectedAddrId) return false;
    if (selectedMethod === 'COD') return true;
    return paymentPhone.length >= 11 && trxId.length >= 6;
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-10 text-center animate-fadeIn">
        <div className="w-20 h-20 bg-gray-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-4xl mb-6 opacity-60">
          🛍️
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t.EMPTY_CART}</h2>
        <p className="text-gray-500 text-sm">
          {lang === 'bn' ? 'আপনার প্রয়োজনীয় পণ্যগুলো যোগ করতে আমাদের হোমপেজে যান।' : 'Visit our homepage to add the products you need.'}
        </p>
        <button 
          className="mt-6 bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-md active:scale-95 transition-transform"
        >
          {lang === 'bn' ? 'শপিং শুরু করুন' : 'Start Shopping'}
        </button>
      </div>
    );
  }

  if (isCheckoutView) {
    return (
      <div className="flex flex-col h-full animate-fadeIn bg-gray-50 dark:bg-slate-950 overflow-hidden">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-5 no-scrollbar pb-10">
          <button 
            onClick={() => setIsCheckoutView(false)}
            className="flex items-center gap-2 text-gray-500 font-bold mb-6 text-sm hover:text-green-600 transition-colors"
          >
            ← {lang === 'bn' ? 'ঝুড়িতে ফিরে যান' : 'Back to Cart'}
          </button>

          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">{t.DELIVERY_ADDRESS}</h2>
              <button 
                onClick={onManageAddresses}
                className="text-[10px] font-black text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg"
              >
                {t.CHANGE}
              </button>
            </div>
            
            {addresses.length === 0 ? (
              <div 
                onClick={onManageAddresses}
                className="p-5 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl flex flex-col items-center gap-2 text-gray-400 cursor-pointer hover:border-green-300 transition-colors"
              >
                <span className="text-2xl">📍</span>
                <span className="text-xs font-bold">{lang === 'bn' ? 'কোনো ঠিকানা পাওয়া যায়নি। নতুন যোগ করুন।' : 'No address found. Add new one.'}</span>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-green-100 dark:border-green-900/30 shadow-sm shadow-green-50 dark:shadow-none">
                 <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">{selectedAddress?.label === 'Home' ? '🏠' : '💼'}</span>
                    <h4 className="text-sm font-black text-gray-800 dark:text-gray-200">{selectedAddress?.label}</h4>
                 </div>
                 <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{selectedAddress?.details}</p>
                 <p className="text-[10px] text-gray-400 mt-2 font-bold">{selectedAddress?.receiverName} • {selectedAddress?.phone}</p>
              </div>
            )}
          </section>

          <h2 className="text-base font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">{t.PAYMENT_METHOD}</h2>

          <div className="space-y-3 mb-8">
            <div 
              onClick={() => setSelectedMethod('COD')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                selectedMethod === 'COD' ? 'border-green-600 bg-green-50 dark:bg-green-900/20' : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-lg">💵</div>
                <span className="font-bold text-gray-800 dark:text-gray-200">{t.COD}</span>
              </div>
              {selectedMethod === 'COD' && <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>}
            </div>

            <div 
              onClick={() => setSelectedMethod('BKASH')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                selectedMethod === 'BKASH' ? 'border-pink-500 bg-pink-50/30 dark:bg-pink-900/10' : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center text-lg">📱</div>
                <span className="font-bold text-gray-800 dark:text-gray-200">{t.BKASH}</span>
              </div>
              {selectedMethod === 'BKASH' && <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>}
            </div>

            <div 
              onClick={() => setSelectedMethod('NAGAD')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                selectedMethod === 'NAGAD' ? 'border-orange-500 bg-orange-50/30 dark:bg-orange-900/10' : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-lg">💰</div>
                <span className="font-bold text-gray-800 dark:text-gray-200">{t.NAGAD}</span>
              </div>
              {selectedMethod === 'NAGAD' && <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>}
            </div>
          </div>

          {selectedMethod !== 'COD' && (
            <div className="space-y-6 animate-fadeIn mb-10">
              {/* Payment Number Display */}
              <div className="bg-slate-900 rounded-[28px] p-6 text-white shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl transform rotate-12">
                    {selectedMethod === 'BKASH' ? 'bK' : 'Ng'}
                 </div>
                 <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                      {lang === 'bn' ? 'টাকা পাঠানোর নম্বর (Personal)' : 'Send Money Number (Personal)'}
                    </p>
                    <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                       <span className="text-xl font-black tracking-widest">{currentPaymentNumber}</span>
                       <button 
                         onClick={handleCopyNumber}
                         className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all relative"
                       >
                         <span className="text-lg">📋</span>
                         {showCopyTooltip && (
                           <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[8px] font-black px-2 py-1 rounded-md animate-bounce whitespace-nowrap">
                             COPIED!
                           </div>
                         )}
                       </button>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                      <p className="text-[9px] font-bold text-orange-200 uppercase tracking-widest">
                         {lang === 'bn' ? 'শুধুমাত্র সেন্ড মানি (পার্সোনাল) করবেন' : 'Personal Number: Use Send Money only'}
                      </p>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">{t.ACCOUNT_NUMBER}</label>
                  <input 
                    type="tel"
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 font-bold dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">{t.TRX_ID}</label>
                  <input 
                    type="text"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="Enter Transaction ID"
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 font-bold uppercase dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom Summary Area */}
        <div className="p-5 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] z-40 transition-colors pb-24">
           <div className="flex justify-between items-center mb-4 px-2">
            <span className="text-gray-500 text-sm font-bold">{lang === 'bn' ? 'মোট দেয় পরিমাণ' : 'Net Total'}</span>
            <span className="text-green-700 dark:text-green-400 font-black text-xl">৳{total + deliveryCharge}</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={isPlacingOrder || !isPaymentValid()}
            className={`w-full py-4 rounded-xl font-bold shadow-lg active:scale-98 transition-all flex items-center justify-center gap-3 ${
              isPlacingOrder || !isPaymentValid() ? 'bg-gray-300 text-gray-500 shadow-none' : 'bg-green-600 text-white shadow-green-100 hover:bg-green-700'
            }`}
          >
            {isPlacingOrder ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {lang === 'bn' ? 'অর্ডার সাবমিট হচ্ছে...' : 'Submitting Order...'}
              </>
            ) : (
              t.CHECKOUT
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fadeIn bg-gray-50 dark:bg-slate-950 overflow-hidden">
      {/* Scrollable List Area */}
      <div className="flex-1 overflow-y-auto p-5 no-scrollbar pb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
            {lang === 'bn' ? 'আপনার ঝুড়ি' : 'Your Cart'} 
            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] px-2 py-0.5 rounded-full">
              {cart.length} {lang === 'bn' ? 'টি' : 'items'}
            </span>
          </h2>
          <button 
            onClick={onClearCart}
            className="text-[10px] font-black text-red-500 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 transition-colors uppercase tracking-widest"
          >
            {lang === 'bn' ? 'সব মুছুন' : 'Clear All'}
          </button>
        </div>

        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-gray-100 dark:border-slate-800 flex gap-4 relative group transition-all hover:shadow-md">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 dark:bg-slate-800 flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                <div>
                  <h3 className="text-[13px] font-black text-gray-900 dark:text-white line-clamp-1 pr-8 leading-tight">{item.name}</h3>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">{item.unit}</p>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Price</span>
                    <span className="text-green-700 dark:text-green-400 font-black text-sm">৳{item.price * item.quantity}</span>
                  </div>
                  <div className="flex items-center bg-gray-50 dark:bg-slate-800 rounded-xl p-1 gap-3 border border-gray-100 dark:border-slate-700">
                    <button 
                      onClick={() => onUpdateQty(item.id, -1)}
                      className="w-7 h-7 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg flex items-center justify-center font-bold text-lg active:scale-110 transition-transform shadow-sm"
                    >
                      −
                    </button>
                    <span className="text-xs font-black w-4 text-center dark:text-white">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQty(item.id, 1)}
                      className="w-7 h-7 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold text-lg active:scale-110 transition-transform shadow-md"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onRemove(item.id)}
                className="absolute top-3 right-3 w-7 h-7 bg-gray-50 dark:bg-slate-800 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Summary Area */}
      <div className="p-5 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] z-40 transition-colors pb-24">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
            <span className="text-gray-400 dark:text-gray-500">{lang === 'bn' ? 'পণ্য মূল্য' : 'Subtotal'}</span>
            <span className="text-gray-900 dark:text-white">৳{total}</span>
          </div>
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
            <span className="text-gray-400 dark:text-gray-500">{lang === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery'}</span>
            <span className="text-gray-900 dark:text-white">৳{deliveryCharge}</span>
          </div>
          <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-50 dark:border-slate-800">
            <span className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs">{t.TOTAL}</span>
            <span className="font-black text-green-700 dark:text-green-400 text-xl">৳{total + deliveryCharge}</span>
          </div>
        </div>
        <button 
          onClick={() => setIsCheckoutView(true)}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-green-100 dark:shadow-none active:scale-98 transition-all flex items-center justify-center gap-3 hover:bg-green-700"
        >
          {lang === 'bn' ? 'অর্ডার সম্পন্ন করুন' : 'Proceed to Checkout'}
        </button>
      </div>
    </div>
  );
};

export default CartScreen;