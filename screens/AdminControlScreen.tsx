
import React, { useMemo, useRef, useState } from 'react';
import { SystemSettings, Screen, Product, Order } from '../types';

interface AdminControlScreenProps {
  settings: SystemSettings;
  products: Product[];
  orders: Order[];
  onUpdateSettings: (settings: SystemSettings) => void;
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
  lang: 'bn' | 'en';
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
  const [manualSyncing, setManualSyncing] = useState(false);

  const handleToggle = (field: keyof SystemSettings) => {
    onUpdateSettings({ ...settings, [field]: !settings[field] });
  };

  const handleValueChange = (field: keyof SystemSettings, value: any) => {
    onUpdateSettings({ ...settings, [field]: value });
  };

  const adminStats = useMemo(() => {
    const completedOrders = orders.filter(o => o.status === 'DELIVERED');
    const revenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const pendingCount = orders.filter(o => o.status === 'PENDING').length;
    const lowStockCount = products.filter(p => p.stock < 10).length;
    const activeProducts = products.filter(p => p.isActive).length;
    
    return { revenue, pendingCount, lowStockCount, activeProducts };
  }, [orders, products]);

  const handleManualSync = () => {
    setManualSyncing(true);
    setTimeout(() => {
      onUpdateSettings({
        ...settings,
        lastSyncTimestamp: new Date().toISOString()
      });
      setManualSyncing(false);
    }, 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleValueChange('storeLogo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="animate-fadeIn min-h-full bg-slate-50 dark:bg-slate-950 pb-24 flex flex-col transition-colors">
      {/* Dynamic Header & Real-time Dashboard */}
      <div className="bg-slate-900 px-6 pt-8 pb-12 shadow-2xl relative overflow-hidden text-white">
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
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">System Operational</p>
              </div>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 p-2 overflow-hidden shadow-inner">
             <img src={settings.storeLogo} alt="Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Highlighted Primary Stats */}
        <div className="bg-white/5 backdrop-blur-xl rounded-[32px] p-6 border border-white/10 shadow-2xl relative z-10 mb-6 group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-8xl transform -rotate-12 translate-x-4">📈</div>
          <div className="relative flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{lang === 'bn' ? 'মোট বিক্রয় (আজ)' : 'Net Revenue (Today)'}</p>
              <h1 className="text-4xl font-black text-white tracking-tight">৳{adminStats.revenue}</h1>
            </div>
            <div className="text-right">
               <span className="text-[10px] font-black text-green-400 bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">+12.5%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 relative z-10">
          <CompactStatCard label={lang === 'bn' ? 'বাকি' : 'Pending'} value={adminStats.pendingCount} color="text-amber-400" />
          <CompactStatCard label={lang === 'bn' ? 'স্টক কম' : 'Low Stock'} value={adminStats.lowStockCount} color="text-red-400" />
          <CompactStatCard label={lang === 'bn' ? 'সক্রিয়' : 'Live'} value={adminStats.activeProducts} color="text-blue-400" />
        </div>
      </div>

      <div className="px-5 -mt-8 relative z-20 space-y-6">
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
                    <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{lang === 'bn' ? 'ক্লাউড ব্যাকআপ' : 'Manual Backup'}</h4>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Last: {new Date(settings.lastSyncTimestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
                <button 
                  onClick={handleManualSync}
                  disabled={manualSyncing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 disabled:opacity-50"
                >
                  {manualSyncing ? '...' : (lang === 'bn' ? 'সিঙ্ক' : 'Sync')}
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
                <ConfigInput 
                  label={lang === 'bn' ? 'দোকানের লোগো (URL)' : 'Store Logo (URL)'} 
                  value={settings.storeLogo} 
                  onChange={v => handleValueChange('storeLogo', v)} 
                  placeholder="https://..."
                />
                <ConfigInput 
                  label={lang === 'bn' ? 'স্লোগান' : 'Headline'} 
                  value={settings.storeSlogan} 
                  onChange={v => handleValueChange('storeSlogan', v)} 
                />
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

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
    <div className={`${color} w-12 h-12 rounded-[20px] flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform`}>
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
