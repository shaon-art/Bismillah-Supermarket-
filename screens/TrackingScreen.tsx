
import React, { useEffect, useState } from 'react';
import { Order, OrderStatus, TrackingStep, Address } from '../types';

interface TrackingScreenProps {
  order: Order;
  isAdmin: boolean;
  onBack: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

interface MapPreviewProps {
  riderPos: { x: number; y: number };
  address?: Address;
}

const MapPreview: React.FC<MapPreviewProps> = ({ riderPos, address }) => {
  const addressText = address?.details || 'ঠিকানা পাওয়া যায়নি';
  const label = address?.label || 'গন্তব্য';

  return (
    <div className="relative w-full h-80 bg-[#f1f5f1] dark:bg-slate-900 rounded-[32px] overflow-hidden border border-green-100 dark:border-green-900/30 shadow-inner group transition-colors">
      {/* Map Background Grid/Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#16a34a 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>
      
      {/* Simulated Road Paths */}
      <svg className="absolute inset-0 w-full h-full opacity-20 dark:opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 30 L45 30 L45 0 M45 30 L45 65 L100 65 M65 65 L65 100 M0 85 L100 85" stroke="#065f46" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="45" cy="30" r="1.5" fill="#16a34a" />
        <circle cx="45" cy="65" r="1.5" fill="#16a34a" />
      </svg>

      {/* Connection Path Animation (Rider to Home) */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path 
          d={`M ${riderPos.x} ${riderPos.y} Q 55 50, 75 35`} 
          stroke="#16a34a" 
          strokeWidth="2" 
          strokeDasharray="4 4" 
          fill="none" 
          className="opacity-40 animate-[dash_20s_linear_infinite]"
        />
      </svg>

      {/* Destination Marker (Home) */}
      <div className="absolute transition-all duration-500" style={{ left: '75%', top: '35%', transform: 'translate(-50%, -100%)' }}>
        <div className="relative flex flex-col items-center">
          {/* Signal Pulse */}
          <div className="absolute -top-6 w-12 h-12 bg-green-500/20 rounded-full animate-ping"></div>
          
          {/* Home Icon */}
          <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center border-2 border-green-500 z-10 transition-transform group-hover:scale-105 relative">
            <span className="text-3xl">{address?.label === 'Home' ? '🏠' : address?.label === 'Office' ? '💼' : '📍'}</span>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></div>
          </div>

          {/* Prompt Address Label (The specific request) */}
          <div className="mt-4 min-w-[160px] max-w-[220px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-green-100 dark:border-green-900/30 shadow-2xl z-20 flex flex-col items-center animate-fadeIn relative ring-4 ring-green-500/10">
            <div className="flex items-center gap-2 mb-1.5 w-full">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-[9px] font-black text-green-700 dark:text-green-400 uppercase tracking-[0.15em] leading-none">{label}</span>
            </div>
            <p className="text-[11px] font-black text-gray-800 dark:text-gray-100 text-center leading-relaxed">
              {addressText}
            </p>
            <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">
               {address?.receiverName}
            </p>
            {/* Tooltip triangle */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-800 rotate-45 border-l border-t border-green-100 dark:border-green-900/30"></div>
          </div>
        </div>
      </div>

      {/* Rider Marker */}
      <div className="absolute transition-all duration-1000 ease-linear" 
           style={{ left: `${riderPos.x}%`, top: `${riderPos.y}%`, transform: 'translate(-50%, -50%)' }}>
        <div className="relative flex items-center justify-center">
          <div className="absolute w-14 h-14 bg-orange-500/20 rounded-full animate-pulse"></div>
          <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-[20px] shadow-2xl flex items-center justify-center border-2 border-orange-500 z-10 ring-4 ring-orange-500/10">
            <span className="text-2xl transform -scale-x-100">🚴</span>
          </div>
          <div className="absolute -top-8 whitespace-nowrap bg-orange-600 px-3 py-1 rounded-full shadow-lg">
            <span className="text-[8px] font-black text-white uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              অন দ্য ওয়ে
            </span>
          </div>
        </div>
      </div>

      {/* Live Indicator Overlay */}
      <div className="absolute bottom-5 left-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg px-4 py-2 rounded-2xl border border-white/50 dark:border-slate-700 shadow-xl flex items-center gap-3 z-30 transition-transform hover:scale-105 cursor-default">
         <div className="relative w-2.5 h-2.5">
           <span className="absolute inset-0 bg-green-500 rounded-full"></span>
           <span className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></span>
         </div>
         <span className="text-[10px] font-black text-gray-700 dark:text-green-400 uppercase tracking-widest leading-none">Live Tracking</span>
      </div>
    </div>
  );
};

const TrackingScreen: React.FC<TrackingScreenProps> = ({ order, isAdmin, onBack, onUpdateStatus }) => {
  const [riderPos, setRiderPos] = useState({ x: 15, y: 85 });

  useEffect(() => {
    // Only move rider if status is SHIPPED
    if (order.status !== 'SHIPPED') {
      setRiderPos({ x: 15, y: 85 });
      return;
    }

    const interval = setInterval(() => {
      setRiderPos(prev => {
        if (prev.x >= 75 && prev.y <= 35) return prev;
        
        // Move towards 75, 35
        const dx = (75 - prev.x) * 0.05;
        const dy = (prev.y - 35) * 0.05;
        
        return {
          x: Math.min(75, prev.x + dx + Math.random() * 0.2),
          y: Math.max(35, prev.y - dy - Math.random() * 0.2)
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [order.status]);

  const isNear = riderPos.x > 65;

  const steps: TrackingStep[] = [
    {
      title: 'অর্ডার গ্রহণ ও যাচাইকরণ',
      description: 'আপনার অর্ডারটি গ্রহণ করা হয়েছে এবং যাচাই করা হচ্ছে।',
      time: order.status === 'PENDING' ? 'চলমান' : 'সম্পন্ন',
      isCompleted: order.status !== 'PENDING' && order.status !== 'CANCELED',
      isActive: order.status === 'PENDING',
      icon: '✅',
    },
    {
      title: 'পণ্য সংগ্রহ ও প্যাকিং',
      description: 'সুপার শপ থেকে আপনার পণ্যগুলো সংগ্রহ ও প্যাক করা হচ্ছে।',
      time: order.status === 'ACCEPTED' ? 'চলমান' : order.status === 'PENDING' ? '--:--' : 'সম্পন্ন',
      isCompleted: ['SHIPPED', 'DELIVERED'].includes(order.status),
      isActive: order.status === 'ACCEPTED',
      icon: '📦',
    },
    {
      title: 'ডেলিভারির জন্য পাঠানো হয়েছে',
      description: 'আপনার প্যাক করা অর্ডারটি এখন ডেলিভারি পথে।',
      time: order.status === 'SHIPPED' ? 'চলমান' : order.status === 'DELIVERED' ? 'সম্পন্ন' : '--:--',
      isCompleted: order.status === 'DELIVERED',
      isActive: order.status === 'SHIPPED',
      icon: '🚴',
    },
    {
      title: 'ডেলিভারি সম্পন্ন',
      description: 'সফলভাবে আপনার ঠিকানায় পণ্য পৌঁছে দেওয়া হয়েছে।',
      time: order.status === 'DELIVERED' ? 'সম্পন্ন' : '--:--',
      isCompleted: order.status === 'DELIVERED',
      isActive: order.status === 'DELIVERED',
      icon: '🏠',
    },
  ];

  return (
    <div className="animate-fadeIn min-h-full bg-white dark:bg-slate-950 pb-10 flex flex-col transition-colors">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-300 active:scale-90 transition-transform"
          >
            ←
          </button>
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white leading-none">অর্ডার ট্র্যাকিং</h2>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-tighter mt-1">ID: {order.id}</p>
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-xl border border-green-100 dark:border-green-900/30 flex items-center gap-2">
          <span className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">
            {order.status === 'DELIVERED' ? 'ডেলিভারড' : order.status === 'SHIPPED' ? (isNear ? 'কাছেই আছে' : 'ডেলিভারি চলছে') : 'প্রসেসিং'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Integrated Map View (Specific Request) */}
        {(order.status === 'SHIPPED' || order.status === 'ACCEPTED' || order.status === 'PENDING') && (
          <div className="px-5 py-4">
            <MapPreview riderPos={riderPos} address={order.deliveryAddress} />
          </div>
        )}

        <div className="px-6 pb-6 mt-4">
          <div className="bg-green-600 dark:bg-green-700 rounded-[32px] p-6 text-white mb-8 shadow-2xl shadow-green-100 dark:shadow-none flex justify-between items-center relative overflow-hidden group">
            <div className="z-10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">অর্ডারের বর্তমান অবস্থা</p>
              <h3 className="text-2xl font-black tracking-tight uppercase">
                {order.status === 'PENDING' ? 'অর্ডার গ্রহণ করা হচ্ছে' : order.status === 'ACCEPTED' ? 'প্যাকিং চলছে' : order.status === 'SHIPPED' ? 'ডেলিভারি চলছে' : order.status === 'DELIVERED' ? 'পৌঁছে গেছে' : 'বাতিল'}
              </h3>
            </div>
            <div className="text-5xl opacity-20 transform -rotate-12 group-hover:rotate-0 transition-transform duration-500 z-10">🕒</div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          </div>

          <div className="relative pl-10 space-y-12">
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-slate-800"></div>

            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className={`absolute -left-[10px] w-5 h-5 rounded-full border-4 border-white dark:border-slate-950 flex items-center justify-center z-10 shadow-sm transition-colors duration-500 ${
                  step.isCompleted ? 'bg-green-500' : step.isActive ? 'bg-orange-500 animate-pulse' : 'bg-gray-200 dark:bg-slate-800'
                }`}>
                  {step.isCompleted && <span className="text-[8px] text-white">✓</span>}
                </div>

                <div className={`transition-all duration-700 ${!step.isCompleted && !step.isActive ? 'opacity-30 blur-[0.5px]' : 'opacity-100'}`}>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-xl">{step.icon}</span>
                    <h4 className={`text-[15px] font-black tracking-tight ${step.isActive ? 'text-green-700 dark:text-green-400 scale-105' : 'text-gray-900 dark:text-gray-100'}`}>
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold leading-relaxed pr-6">
                    {step.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-1 h-1 bg-gray-300 dark:bg-slate-700 rounded-full"></span>
                    <p className="text-[9px] text-gray-400 dark:text-gray-600 font-black uppercase tracking-widest italic">
                       Status: {step.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="px-5 pb-8 pt-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0 z-40 space-y-3 transition-colors">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex items-center justify-center gap-2">
            <span className="text-sm">🛡️</span>
            <p className="text-[10px] font-black text-amber-800 dark:text-amber-500 uppercase text-center tracking-widest leading-none">Admin Control Panel</p>
          </div>
          
          {order.status === 'PENDING' && (
            <button 
              onClick={() => onUpdateStatus(order.id, 'ACCEPTED')}
              className="w-full bg-blue-600 text-white py-4 rounded-3xl font-black text-sm shadow-xl shadow-blue-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              ✅ অর্ডার গ্রহণ করুন
            </button>
          )}

          {order.status === 'ACCEPTED' && (
            <button 
              onClick={() => onUpdateStatus(order.id, 'SHIPPED')}
              className="w-full bg-orange-500 text-white py-4 rounded-3xl font-black text-sm shadow-xl shadow-orange-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              🚀 ডেলিভারিতে পাঠান
            </button>
          )}

          {order.status === 'SHIPPED' && (
            <button 
              onClick={() => onUpdateStatus(order.id, 'DELIVERED')}
              className="w-full bg-green-600 text-white py-4 rounded-3xl font-black text-sm shadow-xl shadow-green-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              🏠 ডেলিভারি সম্পন্ন করুন
            </button>
          )}

          {order.status === 'DELIVERED' && (
            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-3xl text-center border border-gray-100 dark:border-slate-700">
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none">Order Completed Successfully</p>
            </div>
          )}

          {order.status === 'CANCELED' && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-3xl text-center border border-red-100 dark:border-red-900/30">
              <p className="text-[11px] font-black text-red-500 uppercase tracking-widest leading-none">Order Canceled</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes dash { to { stroke-dashoffset: -100; } }
      `}</style>
    </div>
  );
};

export default TrackingScreen;
