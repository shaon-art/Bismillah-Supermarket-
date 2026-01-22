import React, { useMemo, useRef, useState, useEffect } from 'react';
import { SystemSettings, Screen, Product, Order } from '../types';
import { storage } from '../utils/storage';

interface AdminControlScreenProps {
  settings: SystemSettings;
  products: Product[];
  orders: Order[];
  onUpdateSettings: (settings: SystemSettings) => void;
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
  lang: 'bn' | 'en';
}

interface DailyStatData {
    date: string;
    overrides: {
        totalOrders?: number;
        totalSales?: number;
        totalReturns?: number;
        returnVal?: number;
    };
}

const AdminControlScreen: React.FC<AdminControlScreenProps> = ({ 
  settings, 
  products,
  orders,
  onUpdateSettings, 
  onBack, 
  onNavigate,
  lang 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const [manualSyncing, setManualSyncing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  // Daily Stats State
  const [dailyStats, setDailyStats] = useState<DailyStatData>({
      date: new Date().toLocaleDateString(),
      overrides: {}
  });
  const [editStatModal, setEditStatModal] = useState<{key: keyof DailyStatData['overrides'], label: string, current: number} | null>(null);
  const [editValue, setEditValue] = useState('');

  // Storage Stats State
  const [storageInfo, setStorageInfo] = useState<{usage: number, quota: number, persisted: boolean} | null>(null);

  useEffect(() => {
    // 1. Storage Check
    const checkStorage = async () => {
        const persisted = await storage.init();
        const estimate = await storage.getEstimate();
        if (estimate) {
            setStorageInfo({
                usage: estimate.usage || 0,
                quota: estimate.quota || 0,
                persisted
            });
        }
    };
    checkStorage();

    // 2. Load Daily Stats
    const todayStr = new Date().toLocaleDateString();
    try {
        const stored = localStorage.getItem('daily_stats_v1');
        if (stored) {
            const parsed: DailyStatData = JSON.parse(stored);
            if (parsed.date === todayStr) {
                setDailyStats(parsed);
            } else {
                // New Day: Reset Stats
                const newData = { date: todayStr, overrides: {} };
                setDailyStats(newData);
                localStorage.setItem('daily_stats_v1', JSON.stringify(newData));
            }
        } else {
            const newData = { date: todayStr, overrides: {} };
            setDailyStats(newData);
            localStorage.setItem('daily_stats_v1', JSON.stringify(newData));
        }
    } catch (e) {
        console.error("Failed to load stats", e);
    }
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleToggle = (field: keyof SystemSettings) => {
    const newVal = !settings[field];
    onUpdateSettings({ ...settings, [field]: newVal });
  };

  const handleValueChange = (field: keyof SystemSettings, value: any) => {
    onUpdateSettings({ ...settings, [field]: value });
  };

  // --- Real-time Calculations ---
  const calculatedToday = useMemo(() => {
      const today = new Date();
      today.setHours(0,0,0,0);
      const todayMs = today.getTime();

      const todayOrders = orders.filter(o => {
          // Try to extract timestamp from ID (ORD-17xxxx)
          const parts = o.id.split('-');
          if (parts.length > 1) {
              const ts = parseInt(parts[1]);
              // Check if valid timestamp (greater than 2023)
              if (!isNaN(ts) && ts > 1672531200000) {
                  return ts >= todayMs;
              }
          }
          // Fallback: If date string matches exactly (Simple string match)
          // Note: This relies on strict format, ID check is more reliable for app-generated orders
          return false; 
      });

      const totalOrders = todayOrders.length;
      // Sales: Sum of all orders that are NOT Canceled
      const totalSales = todayOrders.filter(o => o.status !== 'CANCELED').reduce((acc, o) => acc + o.total, 0);
      
      const canceledOrders = todayOrders.filter(o => o.status === 'CANCELED');
      const totalReturns = canceledOrders.length;
      const returnVal = canceledOrders.reduce((acc, o) => acc + o.total, 0);

      return { totalOrders, totalSales, totalReturns, returnVal };
  }, [orders]);

  // Merge Calculated with Manual Overrides
  const displayStats = {
      totalOrders: dailyStats.overrides.totalOrders ?? calculatedToday.totalOrders,
      totalSales: dailyStats.overrides.totalSales ?? calculatedToday.totalSales,
      totalReturns: dailyStats.overrides.totalReturns ?? calculatedToday.totalReturns,
      returnVal: dailyStats.overrides.returnVal ?? calculatedToday.returnVal,
  };

  const handleSaveStat = () => {
      if (!editStatModal) return;
      const val = parseInt(editValue);
      
      const newStats = {
          ...dailyStats,
          overrides: {
              ...dailyStats.overrides,
              [editStatModal.key]: isNaN(val) ? undefined : val
          }
      };
      
      setDailyStats(newStats);
      localStorage.setItem('daily_stats_v1', JSON.stringify(newStats));
      setEditStatModal(null);
  };

  const handleResetStat = () => {
      if (!editStatModal) return;
      const newStats = {
          ...dailyStats,
          overrides: {
              ...dailyStats.overrides,
              [editStatModal.key]: undefined // Remove override
          }
      };
      setDailyStats(newStats);
      localStorage.setItem('daily_stats_v1', JSON.stringify(newStats));
      setEditStatModal(null);
  };

  const adminStats = useMemo(() => {
    const pendingCount = orders.filter(o => o.status === 'PENDING').length;
    const lowStockCount = products.filter(p => p.stock < 10).length;
    const activeProducts = products.filter(p => p.isActive).length;
    return { pendingCount, lowStockCount, activeProducts };
  }, [orders, products]);

  const handleManualSync = () => {
    setManualSyncing(true);
    setTimeout(() => {
      onUpdateSettings({
        ...settings,
        lastSyncTimestamp: new Date().toISOString()
      });
      setManualSyncing(false);
    }, 1500);
  };

  const handleBackup = () => {
    storage.createBackup();
    alert(lang === 'bn' ? 'ডাটাবেস ব্যাকআপ মোবাইল স্টোরেজে সেভ করা হয়েছে।' : 'Database backup saved to mobile storage.');
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত? বর্তমান সব ডাটা মুছে ব্যাকআপ ফাইল থেকে রিস্টোর করা হবে।' : 'Are you sure? This will overwrite current data with the backup.')) {
        setIsRestoring(true);
        storage.restoreBackup(file)
          .then(() => {
            alert(lang === 'bn' ? 'সফলভাবে রিস্টোর হয়েছে! অ্যাপ রিলোড হচ্ছে...' : 'Restore successful! Reloading...');
            window.location.reload();
          })
          .catch(err => {
            alert('Failed to restore: ' + err);
            setIsRestoring(false);
          });
      }
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(lang === 'bn' ? 'ছবির সাইজ অনেক বড়। দয়া করে ৫ মেগাবাইটের কম সাইজের ছবি দিন।' : 'Image size is too large. Please upload an image under 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 256;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/png');
            handleValueChange('storeLogo', dataUrl);
          }
        };
        
        if (event.target?.result) {
            img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="animate-fadeIn min-h-full bg-slate-50 dark:bg-slate-950 pb-24 flex flex-col transition-colors">
      {/* Header & Daily Stats Dashboard */}
      <div className="bg-slate-900 px-6 pt-8 pb-12 shadow-2xl relative overflow-hidden text-white rounded-b-[40px]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 rounded-full -mr-40 -mt-40 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/5 rounded-full -ml-20 -mb-20 blur-2xl"></div>
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-90 transition-all border border-white/5">
              ←
            </button>
            <div>
              <h2 className="text-xl font-black tracking-tight">{lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin Hub'}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">{lang === 'bn' ? 'সিস্টেম সচল' : 'System Online'}</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 p-2 overflow-hidden shadow-inner cursor-pointer hover:bg-white/10 transition-colors relative group"
            title={lang === 'bn' ? 'লোগো পরিবর্তন করুন' : 'Change Logo'}
          >
             <img src={settings.storeLogo} alt="Logo" className="w-full h-full object-contain" />
             <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-[8px] font-bold text-white">EDIT</span>
             </div>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
        </div>

        {/* Daily Business Monitor (Editable) */}
        <div className="relative z-10 mb-6">
            <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    📊 {lang === 'bn' ? 'দৈনিক হিসাব (আজ)' : 'Daily Stats (Today)'}
                </h3>
                <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded-md text-slate-300">
                    {new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB')}
                </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <EditableStatCard 
                    label={lang === 'bn' ? 'মোট অর্ডার' : 'Total Orders'} 
                    value={displayStats.totalOrders} 
                    isEdited={dailyStats.overrides.totalOrders !== undefined}
                    onClick={() => { setEditValue(String(displayStats.totalOrders)); setEditStatModal({ key: 'totalOrders', label: lang === 'bn' ? 'মোট অর্ডার' : 'Total Orders', current: displayStats.totalOrders }); }}
                    color="bg-blue-500/10 text-blue-400 border-blue-500/20"
                />
                <EditableStatCard 
                    label={lang === 'bn' ? 'মোট বিক্রয়' : 'Total Sales'} 
                    value={`৳${displayStats.totalSales}`} 
                    isEdited={dailyStats.overrides.totalSales !== undefined}
                    onClick={() => { setEditValue(String(displayStats.totalSales)); setEditStatModal({ key: 'totalSales', label: lang === 'bn' ? 'মোট বিক্রয়' : 'Total Sales', current: displayStats.totalSales }); }}
                    color="bg-green-500/10 text-green-400 border-green-500/20"
                />
                <EditableStatCard 
                    label={lang === 'bn' ? 'অর্ডার রিটার্ন' : 'Returns (Qty)'} 
                    value={displayStats.totalReturns} 
                    isEdited={dailyStats.overrides.totalReturns !== undefined}
                    onClick={() => { setEditValue(String(displayStats.totalReturns)); setEditStatModal({ key: 'totalReturns', label: lang === 'bn' ? 'অর্ডার রিটার্ন' : 'Returns (Qty)', current: displayStats.totalReturns }); }}
                    color="bg-orange-500/10 text-orange-400 border-orange-500/20"
                />
                <EditableStatCard 
                    label={lang === 'bn' ? 'রিটার্ন অ্যামাউন্ট' : 'Return Value'} 
                    value={`৳${displayStats.returnVal}`} 
                    isEdited={dailyStats.overrides.returnVal !== undefined}
                    onClick={() => { setEditValue(String(displayStats.returnVal)); setEditStatModal({ key: 'returnVal', label: lang === 'bn' ? 'রিটার্ন অ্যামাউন্ট' : 'Return Value', current: displayStats.returnVal }); }}
                    color="bg-red-500/10 text-red-400 border-red-500/20"
                />
            </div>
        </div>

        {/* Live System Stats */}
        <div className="grid grid-cols-3 gap-3 relative z-10">
          <CompactStatCard label={lang === 'bn' ? 'পেন্ডিং' : 'Pending'} value={adminStats.pendingCount} color="text-amber-400" />
          <CompactStatCard label={lang === 'bn' ? 'স্টক কম' : 'Low Stock'} value={adminStats.lowStockCount} color="text-red-400" />
          <CompactStatCard label={lang === 'bn' ? 'সক্রিয়' : 'Live'} value={adminStats.activeProducts} color="text-blue-400" />
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-20 space-y-6">
        {/* Management Quick Links */}
        <section className="space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'bn' ? 'দ্রুত ম্যানেজমেন্ট' : 'Management Shortcuts'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <ManagementTile 
              icon="📦" 
              title={lang === 'bn' ? 'পণ্য' : 'Inventory'} 
              color="bg-blue-600" 
              onClick={() => onNavigate('PRODUCT_MANAGEMENT')} 
            />
            <ManagementTile 
              icon="🚚" 
              title={lang === 'bn' ? 'অর্ডার' : 'Shipments'} 
              color="bg-orange-600" 
              onClick={() => onNavigate('ORDERS')} 
            />
            <ManagementTile 
              icon="👥" 
              title={lang === 'bn' ? 'ইউজার' : 'Directory'} 
              color="bg-slate-800" 
              onClick={() => onNavigate('USER_MANAGEMENT')} 
            />
            <ManagementTile 
              icon="📂" 
              title={lang === 'bn' ? 'বিভাগ' : 'Catalog'} 
              color="bg-emerald-600" 
              onClick={() => onNavigate('CATEGORY_MANAGEMENT')} 
            />
          </div>
        </section>

        {/* Global Sales & Offers */}
        <section className="space-y-3">
          <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest ml-1">{lang === 'bn' ? 'মার্কেটিং ও অফার' : 'Campaign Management'}</h3>
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-2xl">⚡</div>
                   <div>
                     <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{lang === 'bn' ? 'স্টোর ওয়াইড সেল' : 'Bulk Discount'}</h4>
                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{settings.globalDiscountEnabled ? 'Campaign Active' : 'Standby'}</p>
                   </div>
                </div>
                <button 
                  onClick={() => handleToggle('globalDiscountEnabled')}
                  className={`w-12 h-6 rounded-full relative transition-all duration-500 ${settings.globalDiscountEnabled ? 'bg-orange-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full shadow-md transition-all duration-300 ${settings.globalDiscountEnabled ? 'right-1 bg-white' : 'left-1 bg-white'}`} />
                </button>
             </div>

             <div className={`space-y-4 transition-all duration-500 ${settings.globalDiscountEnabled ? 'opacity-100' : 'opacity-40 blur-[0.5px] pointer-events-none'}`}>
               <div className="flex justify-between items-center mb-1">
                 <span className="text-[10px] font-black uppercase text-slate-400">{lang === 'bn' ? 'অফার শতাংশ' : 'Discount Level'}</span>
                 <span className="text-2xl font-black text-orange-600">{settings.globalDiscountPercentage}%</span>
               </div>
               <input 
                  type="range" 
                  min="0" 
                  max="90" 
                  step="5"
                  value={settings.globalDiscountPercentage}
                  onChange={(e) => handleValueChange('globalDiscountPercentage', Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-orange-600"
               />
             </div>
          </div>
        </section>

        {/* Infrastructure & Sync */}
        <section className="space-y-3">
          <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest ml-1">{lang === 'bn' ? 'ইনফ্রাস্ট্রাকচার' : 'System & Sync'}</h3>
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
             <div className="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${manualSyncing ? 'animate-spin' : ''}`}>🔄</div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{lang === 'bn' ? 'সার্ভার সিঙ্ক' : 'Server Sync'}</h4>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                       {manualSyncing ? (lang === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...') : (lang === 'bn' ? 'অটোমেটিক' : 'Automatic')}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleManualSync}
                  disabled={manualSyncing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 disabled:opacity-50 transition-all"
                >
                  {manualSyncing ? '...' : (lang === 'bn' ? 'ফোর্স সিঙ্ক' : 'Force Sync')}
                </button>
             </div>

             <div className="grid grid-cols-1 gap-4">
                <ControlSwitch 
                  icon="🏪" 
                  title={lang === 'bn' ? 'স্টোর অপারেশন' : 'Live Operations'} 
                  active={settings.isStoreOpen} 
                  onToggle={() => handleToggle('isStoreOpen')} 
                />
                <ControlSwitch 
                  icon="🤖" 
                  title={lang === 'bn' ? 'স্মার্ট অ্যাসিস্ট্যান্ট' : 'AI Support'} 
                  active={settings.aiAssistantEnabled} 
                  onToggle={() => handleToggle('aiAssistantEnabled')} 
                />
                <ControlSwitch 
                  icon="🛠️" 
                  title={lang === 'bn' ? 'মেইনটেন্যান্স মোড' : 'Safety Mode'} 
                  active={settings.maintenanceMode} 
                  onToggle={() => handleToggle('maintenanceMode')} 
                />
             </div>
          </div>
        </section>

        {/* Configuration Details */}
        <section className="space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'bn' ? 'স্টোর কনফিগারেশন' : 'Configurations'}</h3>
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
             <div className="grid grid-cols-2 gap-4">
                <ConfigInput 
                  label={lang === 'bn' ? 'ডেলিভারি (৳)' : 'Shipping (৳)'} 
                  value={settings.deliveryCharge} 
                  type="number"
                  onChange={v => handleValueChange('deliveryCharge', Number(v))} 
                />
                <ConfigInput 
                  label={lang === 'bn' ? 'মিন অর্ডার' : 'Min Order'} 
                  value={settings.minOrderAmount} 
                  type="number"
                  onChange={v => handleValueChange('minOrderAmount', Number(v))} 
                />
             </div>
             
             <div className="pt-4 border-t border-slate-50 dark:border-slate-800 space-y-4">
                <div>
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">
                      {lang === 'bn' ? 'দোকানের লোগো (URL/Upload)' : 'Store Logo (URL/Upload)'}
                   </label>
                   <div className="flex gap-2">
                      <div className="flex-1">
                          <input 
                            type="text" 
                            value={settings.storeLogo} 
                            onChange={e => handleValueChange('storeLogo', e.target.value)} 
                            placeholder="https://..."
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-[11px] font-bold dark:text-white focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                          />
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-slate-100 dark:bg-slate-800 px-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                        title="Upload Image"
                      >
                        📂
                      </button>
                   </div>
                </div>
                
                <ConfigInput 
                  label={lang === 'bn' ? 'স্লোগান' : 'Headline'} 
                  value={settings.storeSlogan} 
                  onChange={v => handleValueChange('storeSlogan', v)} 
                />
             </div>
          </div>
        </section>

        {/* Secure Backup Storage - The "Soldier" Feature */}
        <section className="space-y-3">
          <h3 className="text-xs font-black text-red-500 uppercase tracking-widest ml-1">{lang === 'bn' ? 'মোবাইল স্টোরেজ ও ডাটাবেস' : 'Device Storage & Database'}</h3>
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border-2 border-red-500/20 shadow-xl shadow-red-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl">🔒</div>
            
            {/* Storage Health Indicator */}
            {storageInfo && (
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{lang === 'bn' ? 'লোকাল স্টোরেজ' : 'Local Storage'}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${storageInfo.persisted ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                       {storageInfo.persisted ? 'PROTECTED' : 'STANDARD'}
                    </span>
                 </div>
                 <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-1000"
                      style={{ width: `${Math.min((storageInfo.usage / storageInfo.quota) * 100, 100)}%` }}
                    ></div>
                 </div>
                 <div className="flex justify-between mt-1.5">
                    <span className="text-[9px] font-bold text-slate-400">{formatBytes(storageInfo.usage)}</span>
                    <span className="text-[9px] font-bold text-slate-400">{formatBytes(storageInfo.quota)}</span>
                 </div>
              </div>
            )}

            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-4 leading-relaxed">
              {lang === 'bn' 
                ? 'আপনার অ্যাপের সকল ডাটা এখানে সুরক্ষিত রাখতে ব্যাকআপ নিন। এই ফাইলটি আপনার পার্সোনাল ফোল্ডার হিসেবে কাজ করবে।' 
                : 'Keep your app data safe here. Download a backup file that acts as your permanent secure folder.'}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleBackup}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex flex-col items-center gap-2"
              >
                <span className="text-xl">💾</span>
                {lang === 'bn' ? 'সেভ করুন' : 'Save to Mobile'}
              </button>
              
              <button 
                onClick={() => backupInputRef.current?.click()}
                disabled={isRestoring}
                className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-4 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all flex flex-col items-center gap-2 border border-slate-200 dark:border-slate-700"
              >
                {isRestoring ? (
                   <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="text-xl">📂</span>
                    {lang === 'bn' ? 'রিস্টোর করুন' : 'Restore Data'}
                  </>
                )}
              </button>
              <input type="file" ref={backupInputRef} className="hidden" accept=".json" onChange={handleRestore} />
            </div>
          </div>
        </section>
      </div>

      {/* Edit Stat Modal */}
      {editStatModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fadeIn bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-[32px] p-6 shadow-2xl relative border border-white/10">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 text-center">
                    {lang === 'bn' ? 'হিসাব পরিবর্তন' : 'Edit Statistic'}
                </h3>
                <p className="text-xs text-center text-slate-500 mb-6 font-bold">{editStatModal.label}</p>
                
                <input 
                    type="number" 
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full text-center text-2xl font-black bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 border-none outline-none focus:ring-2 focus:ring-blue-500 mb-6 dark:text-white"
                    autoFocus
                />
                
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={handleSaveStat}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95"
                    >
                        {lang === 'bn' ? 'সেভ করুন' : 'Save'}
                    </button>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleResetStat}
                            className="flex-1 py-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95"
                        >
                            {lang === 'bn' ? 'রিসেট' : 'Reset'}
                        </button>
                        <button 
                            onClick={() => setEditStatModal(null)}
                            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95"
                        >
                            {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                        </button>
                    </div>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};

// New Component for Editable Stats
const EditableStatCard: React.FC<{ label: string; value: string | number; isEdited: boolean; onClick: () => void; color: string }> = ({ label, value, isEdited, onClick, color }) => (
    <div onClick={onClick} className={`relative p-4 rounded-2xl border backdrop-blur-md flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all group ${color}`}>
        {isEdited && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-sm" title="Edited Manually"></div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs">✏️</span>
        </div>
        <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-70">{label}</p>
        <p className="text-xl font-black tracking-tight">{value}</p>
    </div>
);

const CompactStatCard: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex flex-col items-center">
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-base font-black ${color}`}>{value}</p>
  </div>
);

const ManagementTile: React.FC<{ icon: string; title: string; color: string; onClick: () => void }> = ({ icon, title, color, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-white dark:bg-slate-900 p-5 rounded-[28px] flex flex-col items-center justify-center gap-2 border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95 transition-all group"
  >
    <div className={`${color} w-12 h-12 rounded-[20px] flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform text-white`}>
      {icon}
    </div>
    <h4 className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{title}</h4>
  </button>
);

const ConfigInput: React.FC<{ label: string; value: any; onChange: (v: string) => void; type?: string; placeholder?: string }> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type} 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-[11px] font-bold dark:text-white focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
    />
  </div>
);

const ControlSwitch: React.FC<{ icon: string; title: string; active: boolean; onToggle: () => void }> = ({ icon, title, active, onToggle }) => (
  <div className="flex items-center justify-between p-2">
    <div className="flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{title}</span>
    </div>
    <button 
      onClick={onToggle}
      className={`w-10 h-5 rounded-full relative transition-all duration-300 ${active ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${active ? 'right-0.5' : 'left-0.5'}`} />
    </button>
  </div>
);

export default AdminControlScreen;