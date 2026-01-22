
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TRANSLATIONS, COLORS, DUMMY_PRODUCTS, DUMMY_ORDERS, CATEGORIES } from './constants';
import { Screen, CartItem, Product, Order, Category, PaymentMethod, Address, OrderStatus, User, SystemSettings, ChatMessage } from './types';
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
import MessagingScreen from './screens/MessagingScreen';
import { GoogleGenAI } from "@google/genai";
import { storage } from './utils/storage';

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

const SplashScreen: React.FC<{ onFinish: () => void, logo: string }> = ({ onFinish, logo }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex flex-col items-center justify-center animate-fadeIn px-6">
      <div className="w-52 h-52 mb-8 bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl shadow-green-100 dark:shadow-none border border-green-50 dark:border-slate-800 flex items-center justify-center relative overflow-hidden p-6 animate-[bounce_2s_infinite]">
         <div className="absolute inset-0 bg-gradient-to-tr from-green-500/5 to-transparent"></div>
         <img src={logo} alt="Store Logo" className="w-full h-full object-contain relative z-10 drop-shadow-md" />
      </div>
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-black text-green-800 dark:text-green-400 leading-tight">
          আসসালামু আলাইকুম
        </h1>
        <p className="text-lg font-bold text-slate-600 dark:text-slate-300">
          বিসমিল্লাহ সুপার মার্কেটে আপনাকে স্বাগতম
        </p>
        <div className="w-16 h-1 bg-green-500 rounded-full mx-auto mt-4 animate-pulse"></div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // --- Persistent State Initialization ---
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.load('currentUser', null));
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    const user = storage.load('currentUser', null);
    if (!user) return 'AUTH';
    return storage.load('currentScreen', 'HOME');
  });
  
  // Data States
  const [cart, setCart] = useState<CartItem[]>(() => storage.load('cart', []));
  const [favorites, setFavorites] = useState<string[]>(() => storage.load('favorites', []));
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => storage.load('recentlyViewedIds', []));
  
  const [products, setProducts] = useState<Product[]>(() => storage.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => storage.getCategories());
  const [orders, setOrders] = useState<Order[]>(() => storage.getOrders());
  const [addresses, setAddresses] = useState<Address[]>(() => storage.load('addresses_v1', [
    {
      id: 'a1',
      label: 'Home',
      receiverName: 'মোঃ শরিফুল ইসলাম',
      phone: '01700-000000',
      details: 'বাড়ি নং ১২, রোড নং ৫, ধানমন্ডি, ঢাকা',
      isDefault: true
    }
  ]));
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => storage.getSettings());

  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastServerUpdate, setLastServerUpdate] = useState(new Date());
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => storage.load('selectedProduct', null));
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(() => storage.load('selectedOrderForTracking', null));
  
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [language, setLanguage] = useState<'bn' | 'en'>(() => (localStorage.getItem('lang') as any) || 'bn');
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => storage.load('notificationsEnabled', true));
  const [soundsEnabled, setSoundsEnabled] = useState(() => storage.load('soundsEnabled', true));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  
  // New State for Category Navigation
  const [targetCategory, setTargetCategory] = useState<string | null>(null);

  const t = TRANSLATIONS[language];

  // --- Real-time Sync Engine ---
  useEffect(() => {
    // 1. Subscribe to storage events (Cross-tab & Same-tab)
    const unsubscribe = storage.subscribe((key, newValue) => {
      if (!newValue) return;
      
      console.log(`[Sync Engine] Update received for: ${key}`);
      
      // Flash sync indicator
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 800);
      setLastServerUpdate(new Date());

      // Update Local State based on key
      switch (key) {
        case 'products_v1': setProducts(newValue); break;
        case 'categories_v1': setCategories(newValue); break;
        case 'orders_v1': setOrders(newValue); break;
        case 'systemSettings_v3': setSystemSettings(newValue); break;
        // Add other keys if needed to be synced across users immediately (e.g. maintenance mode)
      }
    });

    // 2. Polling for "Server" updates (Simulates fetching from backend)
    const intervalId = setInterval(() => {
      // In a real app, this would fetch('/api/settings')
      // Here we re-read storage to ensure we catch any updates we might have missed
      const latestSettings = storage.getSettings();
      if (JSON.stringify(latestSettings) !== JSON.stringify(systemSettings)) {
        setSystemSettings(latestSettings);
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 500);
      }
      
      const latestProducts = storage.getProducts();
      if (JSON.stringify(latestProducts) !== JSON.stringify(products)) {
         setProducts(latestProducts);
      }
      // Note: We don't strictly poll everything to save resources in this prototype
    }, 2000); // Check every 2 seconds

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [systemSettings, products]); // Deps indicate what we are comparing against

  // --- Initial Setup ---
  useEffect(() => {
    storage.init().then(persisted => {
      if (persisted) console.log("Device storage persistence active");
    });

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

  // --- User Action Persisters ---
  // Note: We only save user-specific data here. Admin data is saved via explicit handlers.
  useEffect(() => {
    storage.save('cart', cart);
    storage.save('favorites', favorites);
    storage.save('recentlyViewedIds', recentlyViewedIds);
    storage.save('addresses_v1', addresses); // User addresses
    
    // UI State
    storage.save('currentScreen', currentScreen);
    storage.save('selectedProduct', selectedProduct);
    storage.save('selectedOrderForTracking', selectedOrderForTracking);
    
    storage.save('notificationsEnabled', notificationsEnabled);
    storage.save('soundsEnabled', soundsEnabled);
  }, [cart, favorites, recentlyViewedIds, addresses, currentScreen, selectedProduct, selectedOrderForTracking, notificationsEnabled, soundsEnabled]);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('lang', language);
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode, language]);

  // --- Handlers (Modified to use storage.save which triggers sync) ---
  
  const handleUpdateSettings = (newSettings: SystemSettings) => {
    // Optimistic update
    setSystemSettings(newSettings);
    // Persist & Broadcast
    storage.save('systemSettings_v3', newSettings);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const newProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    setProducts(newProducts);
    storage.save('products_v1', newProducts);
  };

  const handleAddProduct = (newProduct: Product) => {
    const newProducts = [...products, newProduct];
    setProducts(newProducts);
    storage.save('products_v1', newProducts);
  };

  const handleDeleteProduct = (id: string) => {
    const newProducts = products.filter(p => p.id !== id);
    setProducts(newProducts);
    storage.save('products_v1', newProducts);
    if (currentScreen === 'PRODUCT_DETAIL') setCurrentScreen('HOME');
  };
  
  const handleAddCategory = (newCat: Category) => {
      const newCats = [...categories, newCat];
      setCategories(newCats);
      storage.save('categories_v1', newCats);
  };
  
  const handleUpdateCategory = (updatedCat: Category) => {
      const newCats = categories.map(c => c.id === updatedCat.id ? updatedCat : c);
      setCategories(newCats);
      storage.save('categories_v1', newCats);
  };
  
  const handleDeleteCategory = (id: string) => {
      const newCats = categories.filter(c => c.id !== id);
      setCategories(newCats);
      storage.save('categories_v1', newCats);
  };
  
  const handleUpdateOrders = (newOrders: Order[]) => {
      setOrders(newOrders);
      storage.save('orders_v1', newOrders);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    storage.save('currentUser', user);
    setCurrentScreen('HOME');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentScreen');
    localStorage.removeItem('selectedProduct');
    localStorage.removeItem('selectedOrderForTracking');
    setCurrentScreen('AUTH');
  };

  const handleSendMessage = async (text: string) => {
    if (!systemSettings.aiAssistantEnabled) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), text, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
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

  const handleCategoryClick = (categoryId: string) => {
    setTargetCategory(categoryId);
    setCurrentScreen('CATEGORIES');
  };

  const renderScreen = () => {
    const adminScreens: Screen[] = ['ADMIN_CONTROL', 'PRODUCT_MANAGEMENT', 'CATEGORY_MANAGEMENT', 'USER_MANAGEMENT'];
    if (adminScreens.includes(currentScreen) && !currentUser?.isAdmin) {
      return <HomeScreen products={products} categories={categories} recentlyViewed={products.filter(p => recentlyViewedIds.includes(p.id))} onProductClick={handleProductClick} onAddToCart={addToCart} onNavigate={setCurrentScreen} onCategoryClick={handleCategoryClick} lang={language} settings={systemSettings} />;
    }

    switch (currentScreen) {
      case 'AUTH': return <AuthScreen onLogin={handleLogin} />;
      case 'HOME': return <HomeScreen products={products} categories={categories} recentlyViewed={products.filter(p => recentlyViewedIds.includes(p.id))} onProductClick={handleProductClick} onAddToCart={addToCart} onNavigate={setCurrentScreen} onCategoryClick={handleCategoryClick} lang={language} settings={systemSettings} />;
      case 'CATEGORIES': return <CategoryScreen products={products} categories={categories} onProductClick={handleProductClick} onAddToCart={addToCart} settings={systemSettings} initialCategoryId={targetCategory || undefined} />;
      case 'CART': return <CartScreen cart={cart} addresses={addresses} onUpdateQty={(id, d) => setCart(p => p.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity+d)} : i))} onRemove={id => setCart(p => p.filter(i => i.id !== id))} onClearCart={() => setCart([])} onPlaceOrder={(m, d, a) => { const newOrders = [{ id: `ORD-${Date.now()}`, date: 'Just now', total: cart.reduce((a,c)=>a+(c.price*c.quantity),0)+systemSettings.deliveryCharge, status: 'PENDING' as OrderStatus, itemsCount: cart.length, items: cart.map(i=>({name:i.name, quantity:i.quantity, price:i.price})), paymentMethod: m, deliveryAddress: a }, ...orders]; handleUpdateOrders(newOrders); setCart([]); setCurrentScreen('ORDERS'); }} onManageAddresses={() => setCurrentScreen('ADDRESS_LIST')} lang={language} isStoreOpen={systemSettings.isStoreOpen} deliveryCharge={systemSettings.deliveryCharge} supportPhone={systemSettings.supportPhone} />;
      case 'PROFILE': return <ProfileScreen currentUser={currentUser!} isAdmin={currentUser!.isAdmin} onLogout={handleLogout} onUpdateUser={u => {setCurrentUser(u); storage.save('currentUser', u);}} onNavigate={setCurrentScreen} lang={language} />;
      case 'MESSAGES': return <MessagingScreen messages={messages} onSendMessage={handleSendMessage} isTyping={isTyping} onBack={() => setCurrentScreen('HOME')} lang={language} settings={systemSettings} />;
      case 'ORDERS': return <OrderListScreen orders={orders} isAdmin={currentUser!.isAdmin} onBack={() => setCurrentScreen('PROFILE')} onCancelOrder={id => handleUpdateOrders(orders.map(o=>o.id===id?{...o,status:'CANCELED'}:o))} onAcceptOrder={id => handleUpdateOrders(orders.map(o=>o.id===id?{...o,status:'ACCEPTED'}:o))} onTrackOrder={o => {setSelectedOrderForTracking(o); setCurrentScreen('TRACKING');}} lang={language} deliveryCharge={systemSettings.deliveryCharge} />;
      case 'TRACKING': return selectedOrderForTracking ? <TrackingScreen order={selectedOrderForTracking} isAdmin={currentUser!.isAdmin} onBack={() => setCurrentScreen('ORDERS')} onUpdateStatus={(id, s) => handleUpdateOrders(orders.map(o=>o.id===id?{...o,status:s}:o))} /> : null;
      case 'SETTINGS': return <SettingsScreen isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} language={language} onSetLanguage={setLanguage} notifications={notificationsEnabled} onToggleNotifications={() => setNotificationsEnabled(!notificationsEnabled)} sounds={soundsEnabled} onToggleSounds={() => setSoundsEnabled(!soundsEnabled)} onBack={() => setCurrentScreen('PROFILE')} onLogout={handleLogout} isAdmin={currentUser?.isAdmin} onNavigate={setCurrentScreen} />;
      case 'PRODUCT_DETAIL': return selectedProduct ? <ProductDetailScreen product={selectedProduct} isAdmin={currentUser!.isAdmin} categories={categories} isFavorite={favorites.includes(selectedProduct.id)} onToggleFavorite={() => setFavorites(p=>p.includes(selectedProduct.id)?p.filter(i=>i!==selectedProduct.id):[...p,selectedProduct.id])} onAddToCart={addToCart} onBack={() => setCurrentScreen('HOME')} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} lang={language} settings={systemSettings} /> : null;
      case 'ADMIN_CONTROL': return <AdminControlScreen settings={systemSettings} products={products} orders={orders} onUpdateSettings={handleUpdateSettings} onBack={() => setCurrentScreen('PROFILE')} onNavigate={setCurrentScreen} lang={language} />;
      case 'PRODUCT_MANAGEMENT': return <ProductManagementScreen products={products} categories={categories} onBack={() => setCurrentScreen('ADMIN_CONTROL')} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} onNavigate={setCurrentScreen} lang={language} />;
      case 'CATEGORY_MANAGEMENT': return <CategoryManagementScreen categories={categories} onBack={() => setCurrentScreen('ADMIN_CONTROL')} onAddCategory={handleAddCategory} onUpdateCategory={handleUpdateCategory} onDeleteCategory={handleDeleteCategory} lang={language} />;
      case 'USER_MANAGEMENT': return <UserManagementScreen onBack={() => setCurrentScreen('ADMIN_CONTROL')} lang={language} />;
      case 'ADDRESS_LIST': return <AddressListScreen addresses={addresses} onBack={() => setCurrentScreen('PROFILE')} onAddAddress={a=>setAddresses(p=>[...p,a])} onUpdateAddress={a=>setAddresses(p=>p.map(i=>i.id===a.id?a:i))} onDeleteAddress={id=>setAddresses(p=>p.filter(i=>i.id!==id))} onSetDefault={id=>setAddresses(p=>p.map(i=>({...i,isDefault:i.id===id})))} />;
      case 'COUPONS': return <CouponScreen onBack={() => setCurrentScreen('HOME')} />;
      default: return <HomeScreen products={products} categories={categories} recentlyViewed={[]} onProductClick={handleProductClick} onAddToCart={addToCart} onNavigate={setCurrentScreen} onCategoryClick={handleCategoryClick} lang={language} settings={systemSettings} />;
    }
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} logo={systemSettings.storeLogo} />;
  }

  const isTabScreen = ['HOME', 'CATEGORIES', 'CART', 'PROFILE', 'SETTINGS'].includes(currentScreen);
  const isNoScrollScreen = ['CATEGORIES', 'MESSAGES'].includes(currentScreen);

  return (
    <div className={`max-w-md mx-auto h-[100dvh] w-full ${isDarkMode ? 'dark' : ''} bg-gray-50 dark:bg-slate-950 overflow-hidden`}>
      <div className="h-full flex flex-col relative shadow-xl overflow-hidden bg-gray-50 dark:bg-slate-950">
        {isTabScreen && (
          <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-5 py-3 sticky top-0 z-50 flex justify-between items-center border-b border-green-50 dark:border-green-900/20 shrink-0">
            <Logo settings={systemSettings} onClick={() => setCurrentScreen('HOME')} />
            <div className="flex gap-2 items-center">
              {isSyncing && <span className="text-[8px] font-black text-green-500 uppercase animate-pulse">Updated</span>}
              <button onClick={() => window.location.reload()} className="w-10 h-10 bg-gray-50 dark:bg-slate-800 text-gray-500 rounded-2xl flex items-center justify-center active:scale-95 transition-transform" title="Refresh">🔄</button>
              <button onClick={() => setCurrentScreen('SETTINGS')} className="w-10 h-10 bg-gray-50 dark:bg-slate-800 text-gray-500 rounded-2xl flex items-center justify-center">⚙️</button>
              <button 
                onClick={() => setCurrentScreen('MESSAGES')} 
                className="w-10 h-10 bg-gradient-to-tr from-green-600 to-green-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-200 dark:shadow-none active:scale-95 transition-transform"
              >
                💬
              </button>
            </div>
          </header>
        )}

        <main className={`flex-1 ${isNoScrollScreen ? 'overflow-hidden' : 'overflow-y-auto'} scroll-smooth no-scrollbar relative overscroll-none`}>
          {renderScreen()}
          {isTabScreen && !isNoScrollScreen && <div className="h-24" />}
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
