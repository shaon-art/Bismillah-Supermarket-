import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TRANSLATIONS, COLORS, DUMMY_PRODUCTS, DUMMY_ORDERS, CATEGORIES } from './constants';
import { Screen, CartItem, Product, Order, Category, PaymentMethod, Address, OrderStatus, User, SystemSettings } from './types';
import HomeScreen from './screens/HomeScreen';
import CategoryScreen from './screens/CategoryScreen';
import CartScreen from './screens/CartScreen';
import ProfileScreen from './screens/ProfileScreen';
import GuideScreen from './screens/GuideScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import OrderListScreen from './screens/OrderListScreen';
import TrackingScreen from './screens/TrackingScreen';
import SettingsScreen from './screens/SettingsScreen';
import CouponScreen from './screens/CouponScreen';
import AddressListScreen from './screens/AddressListScreen';
import AuthScreen from './screens/AuthScreen';
import ProductManagementScreen from './screens/ProductManagementScreen';
import UserManagementScreen from './screens/UserManagementScreen';
import AdminControlScreen from './screens/AdminControlScreen';
import CategoryManagementScreen from './screens/CategoryManagementScreen';
import { GoogleGenAI } from "@google/genai";

const Logo: React.FC<{ settings: SystemSettings, onClick: () => void }> = ({ settings, onClick }) => {
  const parts = settings.storeName.split(' ');
  const mainName = parts[0];
  const subName = parts.slice(1).join(' ');

  return (
    <div 
      className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-all" 
      onClick={onClick}
      role="button"
      aria-label="Go to Home"
    >
      <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-green-50 dark:border-slate-700 overflow-hidden p-1.5 transition-transform">
        <img 
          src={settings.storeLogo} 
          alt="Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col">
        <h1 className="text-[14px] font-black text-green-900 dark:text-green-50 leading-none flex items-center gap-1">
          {mainName} <span className="text-red-600 font-extrabold">{subName}</span>
        </h1>
        <p className="text-[7px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-1">
          {settings.storeSlogan}
        </p>
      </div>
    </div>
  );
};

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

const MessagingScreen: React.FC<{ 
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
  onBack: () => void; 
  lang: 'bn' | 'en' 
}> = ({ messages, onSendMessage, isTyping, onBack, lang }) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="animate-fadeIn h-full bg-gray-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-4 sticky top-0 z-40">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400 active:scale-90 transition-transform">
          <span className="text-xl">←</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-xl relative shadow-inner">
            🤖
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-900 dark:text-white leading-none">Smart Assistant</h2>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[8px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest bg-orange-100 dark:bg-orange-900/20 px-1.5 py-0.5 rounded">AI Active</span>
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-green-600 text-white rounded-tr-none' 
                : 'bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-slate-800 backdrop-blur-sm'
            }`}>
              <p className="text-sm font-medium leading-relaxed whitespace-pre-line">{msg.text}</p>
              <p className={`text-[8px] mt-1 font-bold uppercase opacity-60 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur rounded-2xl px-4 py-3 border border-gray-100 dark:border-slate-800">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-2xl p-2 border border-gray-100 dark:border-slate-700 shadow-inner">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={lang === 'bn' ? 'মেসেজ লিখুন...' : 'Type a message...'}
            className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm font-bold dark:text-white"
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim() || isTyping}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              !inputText.trim() || isTyping 
                ? 'bg-gray-200 text-gray-400' 
                : 'bg-green-600 text-white shadow-lg active:scale-90'
            }`}
          >
            ✈️
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const loadFromLS = <T,>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };

  const saveToLS = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const [currentUser, setCurrentUser] = useState<User | null>(() => loadFromLS('currentUser', null));
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    const user = loadFromLS('currentUser', null);
    return user ? 'HOME' : 'AUTH';
  });
  
  const [cart, setCart] = useState<CartItem[]>(() => loadFromLS('cart', []));
  const [favorites, setFavorites] = useState<string[]>(() => loadFromLS('favorites', []));
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => loadFromLS('recentlyViewedIds', []));
  
  const [products, setProducts] = useState<Product[]>(() => loadFromLS('products_v1', DUMMY_PRODUCTS));
  const [categories, setCategories] = useState<Category[]>(() => loadFromLS('categories_v1', CATEGORIES));
  const [orders, setOrders] = useState<Order[]>(() => loadFromLS('orders_v1', DUMMY_ORDERS));
  const [addresses, setAddresses] = useState<Address[]>(() => loadFromLS('addresses_v1', [
    {
      id: 'a1',
      label: 'Home',
      receiverName: 'মোঃ শরিফুল ইসলাম',
      phone: '01700-000000',
      details: 'বাড়ি নং ১২, রোড নং ৫, ধানমন্ডি, ঢাকা',
      isDefault: true
    }
  ]));

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => loadFromLS('systemSettings_v3', {
    isStoreOpen: true,
    maintenanceMode: false,
    deliveryCharge: 50,
    minOrderAmount: 100,
    aiAssistantEnabled: true,
    broadcastMessage: "",
    storeName: "বিসমিল্লাহ সুপার মার্কেট",
    storeSlogan: "তাজা ও বিশুদ্ধ পণ্যের আস্থার প্রতীক",
    storeLogo: "https://raw.githubusercontent.com/BismillahSupermarket/Assets/main/logo.png",
    supportPhone: "01978501415",
    globalDiscountEnabled: false,
    globalDiscountPercentage: 10,
    autoSyncEnabled: true,
    lastSyncTimestamp: new Date().toISOString()
  }));

  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [language, setLanguage] = useState<'bn' | 'en'>(() => (localStorage.getItem('lang') as any) || 'bn');
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => loadFromLS('notificationsEnabled', true));
  const [soundsEnabled, setSoundsEnabled] = useState(() => loadFromLS('soundsEnabled', true));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (!currentUser && currentScreen !== 'AUTH') {
      setCurrentScreen('AUTH');
    } else if (currentUser && currentScreen === 'AUTH') {
      setCurrentScreen('HOME');
    }
  }, [currentUser, currentScreen]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!systemSettings.autoSyncEnabled) return;
    const syncData = () => {
      setIsSyncing(true);
      saveToLS('products_v1', products);
      saveToLS('categories_v1', categories);
      saveToLS('orders_v1', orders);
      saveToLS('addresses_v1', addresses);
      saveToLS('cart', cart);
      saveToLS('favorites', favorites);
      saveToLS('recentlyViewedIds', recentlyViewedIds);
      saveToLS('systemSettings_v3', systemSettings);
      setTimeout(() => setIsSyncing(false), 1000);
    };
    const timer = setTimeout(syncData, 2000);
    return () => clearTimeout(timer);
  }, [products, categories, orders, addresses, cart, favorites, recentlyViewedIds, systemSettings]);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('lang', language);
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode, language]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    saveToLS('currentUser', user);
    setCurrentScreen('HOME');
  };

  const handleLogout = () => {
    if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) {
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      setCurrentScreen('AUTH');
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!systemSettings.aiAssistantEnabled) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), text, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // In Vercel, Environment Variables are accessed via process.env during build or runtime
      // Ensure API_KEY is set in Vercel Project Settings > Environment Variables
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === '') {
        throw new Error("API Key is missing. Please set API_KEY in Vercel settings.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: text,
        config: { 
          systemInstruction: `You are a helpful customer support agent for ${systemSettings.storeName}. Respond in ${language === 'bn' ? 'Bengali' : 'English'}. Keep responses professional and related to groceries.` 
        }
      });
      
      const supportMsg: ChatMessage = { 
        id: (Date.now()+1).toString(), 
        text: response.text || "...", 
        sender: 'support', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, supportMsg]);
    } catch (e) {
      console.error("Gemini API Error:", e);
      const errorMsg: ChatMessage = {
        id: (Date.now()+1).toString(),
        text: language === 'bn' ? "দুঃখিত, এআই অ্যাসিস্ট্যান্ট এখন কাজ করছে না।" : "Sorry, I'm having trouble responding right now.",
        sender: 'support',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleProductClick = (product: Product) => { 
    setSelectedProduct(product); 
    setRecentlyViewedIds(prev => [product.id, ...prev.filter(id => id !== product.id)].slice(0, 10)); 
    setCurrentScreen('PRODUCT_DETAIL'); 
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'AUTH': return <AuthScreen onLogin={handleLogin} />;
      case 'HOME': return <HomeScreen products={products} categories={categories} recentlyViewed={products.filter(p => recentlyViewedIds.includes(p.id))} onProductClick={handleProductClick} onAddToCart={addToCart} onNavigate={setCurrentScreen} lang={language} settings={systemSettings} />;
      case 'CATEGORIES': return <CategoryScreen products={products} categories={categories} onProductClick={handleProductClick} onAddToCart={addToCart} settings={systemSettings} />;
      case 'CART': return <CartScreen cart={cart} addresses={addresses} onUpdateQty={(id, d) => setCart(p => p.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity+d)} : i))} onRemove={id => setCart(p => p.filter(i => i.id !== id))} onClearCart={() => setCart([])} onPlaceOrder={(m, d, a) => { setOrders(p => [{ id: `ORD-${Date.now()}`, date: 'Just now', total: cart.reduce((a,c)=>a+(c.price*c.quantity),0)+systemSettings.deliveryCharge, status: 'PENDING', itemsCount: cart.length, items: cart.map(i=>({name:i.name, quantity:i.quantity, price:i.price})), paymentMethod: m, deliveryAddress: a }, ...p]); setCart([]); setCurrentScreen('ORDERS'); }} onManageAddresses={() => setCurrentScreen('ADDRESS_LIST')} lang={language} isStoreOpen={systemSettings.isStoreOpen} deliveryCharge={systemSettings.deliveryCharge} />;
      case 'PROFILE': return <ProfileScreen currentUser={currentUser!} isAdmin={currentUser!.isAdmin} onLogout={handleLogout} onUpdateUser={u => {setCurrentUser(u); saveToLS('currentUser', u);}} onNavigate={setCurrentScreen} lang={language} />;
      case 'MESSAGES': return <MessagingScreen messages={messages} onSendMessage={handleSendMessage} isTyping={isTyping} onBack={() => setCurrentScreen('HOME')} lang={language} />;
      case 'ORDERS': return <OrderListScreen orders={orders} isAdmin={currentUser!.isAdmin} onBack={() => setCurrentScreen('PROFILE')} onCancelOrder={id => setOrders(p=>p.map(o=>o.id===id?{...o,status:'CANCELED'}:o))} onAcceptOrder={id => setOrders(p=>p.map(o=>o.id===id?{...o,status:'ACCEPTED'}:o))} onTrackOrder={o => {setSelectedOrderForTracking(o); setCurrentScreen('TRACKING');}} lang={language} deliveryCharge={systemSettings.deliveryCharge} />;
      case 'TRACKING': return selectedOrderForTracking ? <TrackingScreen order={selectedOrderForTracking} isAdmin={currentUser!.isAdmin} onBack={() => setCurrentScreen('ORDERS')} onUpdateStatus={(id, s) => setOrders(p=>p.map(o=>o.id===id?{...o,status:s}:o))} /> : null;
      case 'SETTINGS': return <SettingsScreen isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} language={language} onSetLanguage={setLanguage} notifications={notificationsEnabled} onToggleNotifications={() => setNotificationsEnabled(!notificationsEnabled)} sounds={soundsEnabled} onToggleSounds={() => setSoundsEnabled(!soundsEnabled)} onBack={() => setCurrentScreen('PROFILE')} onLogout={handleLogout} isAdmin={currentUser?.isAdmin} onNavigate={setCurrentScreen} />;
      case 'PRODUCT_DETAIL': return selectedProduct ? <ProductDetailScreen product={selectedProduct} isAdmin={currentUser!.isAdmin} categories={categories} isFavorite={favorites.includes(selectedProduct.id)} onToggleFavorite={() => setFavorites(p=>p.includes(selectedProduct.id)?p.filter(i=>i!==selectedProduct.id):[...p,selectedProduct.id])} onAddToCart={addToCart} onBack={() => setCurrentScreen('HOME')} onUpdateProduct={p=>setProducts(pr=>pr.map(i=>i.id===p.id?p:i))} onDeleteProduct={id=>{setProducts(p=>p.filter(i=>i.id!==id)); setCurrentScreen('HOME');}} lang={language} settings={systemSettings} /> : null;
      case 'ADMIN_CONTROL': return <AdminControlScreen settings={systemSettings} products={products} orders={orders} onUpdateSettings={setSystemSettings} onBack={() => setCurrentScreen('PROFILE')} onNavigate={setCurrentScreen} lang={language} />;
      case 'PRODUCT_MANAGEMENT': return <ProductManagementScreen products={products} categories={categories} onBack={() => setCurrentScreen('ADMIN_CONTROL')} onAddProduct={p=>setProducts(pr=>[...pr,p])} onUpdateProduct={p=>setProducts(pr=>pr.map(i=>i.id===p.id?p:i))} onDeleteProduct={id=>setProducts(p=>p.filter(i=>i.id!==id))} onNavigate={setCurrentScreen} lang={language} />;
      case 'CATEGORY_MANAGEMENT': return <CategoryManagementScreen categories={categories} onBack={() => setCurrentScreen('ADMIN_CONTROL')} onAddCategory={c=>setCategories(p=>[...p,c])} onUpdateCategory={c=>setCategories(p=>p.map(i=>i.id===c.id?c:i))} onDeleteCategory={id=>setCategories(p=>p.filter(i=>i.id!==id))} lang={language} />;
      case 'USER_MANAGEMENT': return <UserManagementScreen onBack={() => setCurrentScreen('ADMIN_CONTROL')} lang={language} />;
      case 'ADDRESS_LIST': return <AddressListScreen addresses={addresses} onBack={() => setCurrentScreen('PROFILE')} onAddAddress={a=>setAddresses(p=>[...p,a])} onUpdateAddress={a=>setAddresses(p=>p.map(i=>i.id===a.id?a:i))} onDeleteAddress={id=>setAddresses(p=>p.filter(i=>i.id!==id))} onSetDefault={id=>setAddresses(p=>p.map(i=>({...i,isDefault:i.id===id})))} />;
      case 'COUPONS': return <CouponScreen onBack={() => setCurrentScreen('HOME')} />;
      default: return <HomeScreen products={products} categories={categories} recentlyViewed={[]} onProductClick={handleProductClick} onAddToCart={addToCart} onNavigate={setCurrentScreen} lang={language} settings={systemSettings} />;
    }
  };

  const isTabScreen = ['HOME', 'CATEGORIES', 'CART', 'PROFILE', 'SETTINGS'].includes(currentScreen);

  return (
    <div className={`max-w-md mx-auto min-h-screen ${isDarkMode ? 'dark' : ''} bg-gray-50 dark:bg-slate-950`}>
      <div className="min-h-screen flex flex-col relative shadow-xl overflow-hidden">
        {isTabScreen && (
          <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-5 py-3 sticky top-0 z-50 flex justify-between items-center border-b border-green-50 dark:border-green-900/20">
            <Logo settings={systemSettings} onClick={() => setCurrentScreen('HOME')} />
            <div className="flex gap-2 items-center">
              {isSyncing && <span className="text-[8px] font-black text-green-500 uppercase animate-pulse">Syncing</span>}
              <button onClick={() => setCurrentScreen('SETTINGS')} className="w-10 h-10 bg-gray-50 dark:bg-slate-800 text-gray-500 rounded-2xl flex items-center justify-center">⚙️</button>
              <button onClick={() => setCurrentScreen('MESSAGES')} className="w-10 h-10 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-2xl flex items-center justify-center">💬</button>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto">
          {renderScreen()}
        </main>

        {isTabScreen && (
          <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-gray-100 dark:border-slate-800 flex justify-around py-3 z-50">
            <NavItem active={currentScreen === 'HOME'} icon="🏠" label={t.HOME} onClick={() => setCurrentScreen('HOME')} />
            <NavItem active={currentScreen === 'CATEGORIES'} icon="📂" label={t.CATEGORY_NAV} onClick={() => setCurrentScreen('CATEGORIES')} />
            <NavItem active={currentScreen === 'CART'} icon="🛒" label={t.CART} onClick={() => setCurrentScreen('CART')} count={cart.length} />
            <NavItem active={currentScreen === 'PROFILE'} icon="👤" label={t.PROFILE} onClick={() => setCurrentScreen('PROFILE')} />
          </nav>
        )}
      </div>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; icon: string; label: string; onClick: () => void; count?: number }> = ({ active, icon, label, onClick, count }) => (
  <button onClick={onClick} className={`flex flex-col items-center flex-1 relative ${active ? 'text-green-700 dark:text-green-400' : 'text-gray-400'}`}>
    <span className="text-xl">{icon}</span>
    <span className="text-[10px] font-extrabold uppercase">{label}</span>
    {count ? <span className="absolute top-0 right-1/4 bg-red-600 text-white text-[8px] px-1 rounded-full">{count}</span> : null}
  </button>
);

export default App;