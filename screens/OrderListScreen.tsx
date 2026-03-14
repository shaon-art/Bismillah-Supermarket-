
import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { Order, OrderStatus } from '../types';

interface OrderListScreenProps {
  orders: Order[];
  isAdmin: boolean;
  onBack: () => void;
  onCancelOrder: (id: string, reason: string) => void;
  onAcceptOrder: (id: string) => void;
  onTrackOrder: (order: Order) => void;
  lang: 'bn' | 'en';
  deliveryCharge: number; // Added to make it dynamic
}

const CANCEL_REASONS_BN = [
  'অর্ডার করতে ভুল করেছি',
  'ডেলিভারি হতে দেরি হচ্ছে',
  'পেমেন্ট পদ্ধতিতে সমস্যা',
  'পণ্যটি স্টকে নেই (Admin)',
  'অন্য কোনো কারণ'
];

const CANCEL_REASONS_EN = [
  'Ordered by mistake',
  'Delivery delay',
  'Payment issue',
  'Out of stock (Admin)',
  'Other reason'
];

const OrderListScreen: React.FC<OrderListScreenProps> = ({ orders, isAdmin, onBack, onCancelOrder, onAcceptOrder, onTrackOrder, lang, deliveryCharge }) => {
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const t = TRANSLATIONS[lang];
  
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(new Set());

  const reasons = lang === 'bn' ? CANCEL_REASONS_BN : CANCEL_REASONS_EN;
  const otherReasonLabel = lang === 'bn' ? 'অন্য কোনো কারণ' : 'Other reason';

  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return { label: lang === 'bn' ? 'ডেলিভারড' : 'Delivered', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
      case 'SHIPPED':
        return { label: lang === 'bn' ? 'ডেলিভারি চলছে' : 'Shipped', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' };
      case 'ACCEPTED':
        return { label: lang === 'bn' ? 'গৃহীত হয়েছে' : 'Accepted', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
      case 'PENDING':
        return { label: lang === 'bn' ? 'প্রক্রিয়াধীন' : 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
      case 'CANCELED':
        return { label: lang === 'bn' ? 'বাতিল' : 'Canceled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
      default:
        return { label: lang === 'bn' ? 'অজানা' : 'Unknown', color: 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-400' };
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'COD': return t.COD;
      case 'BKASH': return t.BKASH;
      case 'NAGAD': return t.NAGAD;
      default: return method;
    }
  };

  const handleStartCancel = (id: string) => {
    setActiveOrderId(id);
    setShowReasonModal(true);
    setSelectedReason('');
    setCustomReason('');
  };

  const handleReasonNext = () => {
    setShowReasonModal(false);
    setShowConfirmModal(true);
  };

  const handleFinalCancel = () => {
    if (activeOrderId) {
      const finalReason = selectedReason === otherReasonLabel ? customReason : selectedReason;
      onCancelOrder(activeOrderId, finalReason);
      setActiveOrderId(null);
      setShowConfirmModal(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedOrderIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isNextDisabled = !selectedReason || (selectedReason === otherReasonLabel && !customReason.trim());

  return (
    <div className="min-h-full bg-gray-50 dark:bg-slate-950 pb-10 relative transition-colors">
      <div className="animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-4 sticky top-0 z-10 transition-colors">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400 active:scale-90 transition-transform"
        >
          <span className="text-xl">←</span>
        </button>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {isAdmin ? t.ORDER_MANAGEMENT : t.ORDER_HISTORY}
        </h2>
      </div>

      <div className="p-5 space-y-4">
        {orders.map((order) => {
          const status = getStatusInfo(order.status);
          const isPending = order.status === 'PENDING';
          const isInProgress = ['ACCEPTED', 'SHIPPED'].includes(order.status);
          const isExpanded = expandedOrderIds.has(order.id);
          const canBeCancelledByAdmin = order.status !== 'DELIVERED' && order.status !== 'CANCELED';

          return (
            <div key={order.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-all overflow-hidden group">
              <div 
                className="p-4 cursor-pointer active:bg-gray-50 dark:active:bg-slate-800 transition-colors"
                onClick={() => toggleExpand(order.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white mb-0.5 tracking-tight">{lang === 'bn' ? 'অর্ডার নং' : 'Order No'}: {order.id}</h3>
                    <p className="text-[11px] text-gray-400 font-bold">{order.date}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${status.color}`}>
                      {status.label}
                    </span>
                    <span className={`text-xs text-gray-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center border-t border-gray-50 dark:border-slate-800 pt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-xs">📦</div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{order.itemsCount} {lang === 'bn' ? 'টি পণ্য' : 'Items'}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-400 font-black uppercase mb-0.5">{lang === 'bn' ? 'মোট মূল্য' : 'Total Value'}</p>
                    <p className="text-green-700 dark:text-green-400 font-black text-base leading-none">৳{order.total}</p>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 animate-fadeIn">
                  <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 space-y-2 border border-gray-100/50 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 border-b border-gray-200 dark:border-slate-700 pb-1">{lang === 'bn' ? 'পণ্যের তালিকা' : 'Items List'}</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                          <span className="font-bold text-gray-700 dark:text-gray-200">{item.name}</span>
                          <span className="text-gray-400">x{item.quantity}</span>
                        </div>
                        <span className="font-black text-gray-900 dark:text-white">৳{item.price}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-slate-700 text-[11px] mt-2 font-black text-green-700 dark:text-green-400">
                      <span>{lang === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Charge'}</span>
                      <span>৳{deliveryCharge}</span>
                    </div>

                    <div className="mt-3 p-2 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-gray-100 dark:border-slate-800 transition-colors">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1">{lang === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{getPaymentLabel(order.paymentMethod)}</span>
                        {order.paymentDetails && (
                          <div className="text-right">
                            <p className="text-[9px] text-gray-400 font-bold">{order.paymentDetails.phone}</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase">{order.paymentDetails.trxId}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="px-4 pb-4 flex gap-3">
                {isAdmin ? (
                  <>
                    {canBeCancelledByAdmin && (
                      <button 
                        onClick={() => handleStartCancel(order.id)}
                        className="flex-1 py-2.5 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-95 border border-red-100 dark:border-red-900/30"
                      >
                        <span>✕</span> {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                      </button>
                    )}
                    {isPending && (
                       <button 
                        onClick={() => onAcceptOrder(order.id)}
                        className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <span>✓</span> {lang === 'bn' ? 'অর্ডার গ্রহণ' : 'Accept Order'}
                      </button>
                    )}
                    {isInProgress && (
                      <button 
                        onClick={() => onTrackOrder(order)}
                        className="flex-1 py-2.5 text-xs font-bold text-white bg-green-600 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <span>📍</span> {lang === 'bn' ? 'আপডেট' : 'Update'}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {/* User Actions */}
                    {isPending && (
                      <button 
                        onClick={() => handleStartCancel(order.id)}
                        className="flex-1 py-2.5 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-95 border border-red-100 dark:border-red-900/30"
                      >
                        <span>✕</span> {t.CANCEL_ORDER}
                      </button>
                    )}
                    {isInProgress && (
                      <button 
                        onClick={() => onTrackOrder(order)}
                        className="flex-1 py-2.5 text-xs font-bold text-white bg-green-600 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <span>📍</span> {t.TRACK_ORDER}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </div>

      {showReasonModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-sm rounded-3xl p-6 shadow-2xl relative my-auto transition-colors animate-scaleIn">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{lang === 'bn' ? 'বাতিল করার কারণ' : 'Cancellation Reason'}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 font-medium">{lang === 'bn' ? 'অর্ডারটি কেন বাতিল করতে চাইছেন তা দয়া করে আমাদের জানান।' : 'Please tell us why you want to cancel.'}</p>
            
            <div className="space-y-3 mb-6">
              {reasons.map((reason) => (
                <label 
                  key={reason} 
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedReason === reason ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="cancelReason" 
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 accent-green-600"
                  />
                  <span className={`text-xs font-bold ${selectedReason === reason ? 'text-green-900 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`}>{reason}</span>
                </label>
              ))}
            </div>

            {selectedReason === otherReasonLabel && (
              <div className="mb-6 animate-fadeIn">
                <textarea 
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder={lang === 'bn' ? "আপনার কারণটি এখানে বিস্তারিত লিখুন..." : "Describe your reason..."}
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 text-xs outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all min-h-[100px] resize-none dark:text-white"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowReasonModal(false)} className="flex-1 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 rounded-xl">{t.CANCEL}</button>
              <button onClick={handleReasonNext} disabled={isNextDisabled} className={`flex-1 py-3 text-xs font-bold text-white rounded-xl shadow-lg transition-all ${isNextDisabled ? 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95'}`}>
                {lang === 'bn' ? 'পরবর্তী ধাপ' : 'Next Step'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-3xl p-6 shadow-2xl relative transition-colors animate-scaleIn">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-red-100 dark:border-red-900/30">⚠️</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">{lang === 'bn' ? 'অর্ডার বাতিল করবেন?' : 'Cancel Order?'}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-6 font-medium leading-relaxed">
              {lang === 'bn' ? `আপনি কি নিশ্চিত যে অর্ডার নম্বর ${activeOrderId} বাতিল করতে চান? এটি আর ফিরিয়ে আনা সম্ভব নয়।` : `Are you sure you want to cancel order ${activeOrderId}? This action cannot be undone.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 rounded-xl">{lang === 'bn' ? 'না, থাক' : 'No'}</button>
              <button onClick={handleFinalCancel} className="flex-1 py-3 text-xs font-bold text-white bg-red-600 rounded-xl shadow-lg active:scale-95 transition-all">
                {lang === 'bn' ? 'হ্যাঁ, বাতিল করুন' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-10 text-center animate-fadeIn">
          <div className="w-20 h-20 bg-gray-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-4xl mb-4 grayscale opacity-50">📦</div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{lang === 'bn' ? 'কোনো অর্ডার পাওয়া যায়নি' : 'No Orders Found'}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{lang === 'bn' ? 'আপনার ঝুড়িতে পণ্য যোগ করুন এবং আজই প্রথম অর্ডারটি সম্পন্ন করুন!' : 'Add items to your cart and complete your first order today!'}</p>
        </div>
      )}
    </div>
  );
};

export default OrderListScreen;
