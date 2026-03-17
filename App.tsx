
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TRANSLATIONS, COLORS, DUMMY_PRODUCTS, DUMMY_ORDERS, CATEGORIES } from './constants';
import { Screen, CartItem, Product, Order, Category, PaymentMethod, Address, OrderStatus, User, SystemSettings, ChatMessage, Coupon, SpecialOffer } from './types';
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
import CouponManagementScreen from './screens/CouponManagementScreen';
import MessagingScreen from './screens/MessagingScreen';
import BazarCalculatorScreen from './screens/BazarCalculatorScreen';
import LegalScreen from './screens/LegalScreen';
import { GoogleGenAI } from "@google/genai";
import { storage } from './utils/storage';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, query, orderBy, where, getDoc, writeBatch } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

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
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as any).src = "https://cdn-icons-png.flaticon.com/512/3724/3724720.png";
          }}
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
    const timer = setTimeout(onFinish, 1200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex flex-col items-center justify-center animate-fadeIn px-6">
      <div className="w-52 h-52 mb-8 bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl shadow-green-100 dark:shadow-none border border-green-50 dark:border-slate-800 flex items-center justify-center relative overflow-hidden p-6 animate-[bounce_2s_infinite]">
         <div className="absolute inset-0 bg-gradient-to-tr from-green-500/5 to-transparent"></div>
         <img 
          src={logo} 
          alt="Store Logo" 
          className="w-full h-full object-contain relative z-10 drop-shadow-md" 
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as any).src = "https://cdn-icons-png.flaticon.com/512/3724/3724720.png";
          }}
        />
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
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => storage.getSettings());

  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastServerUpdate, setLastServerUpdate] = useState(new Date());
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => storage.load('selectedProduct', null));
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(() => storage.load('selectedOrderForTracking', null));
  const [legalType, setLegalType] = useState<'PRIVACY' | 'TERMS'>('PRIVACY');
  
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

  // --- Firebase Sync Engine ---
  useEffect(() => {
    // 1. Listen for Auth Changes
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setCurrentUser(userData);
            storage.save('currentUser', userData);
          } else {
            // If doc doesn't exist, it might be a new user being created in AuthScreen.
            // We'll set the user state but NOT navigate to HOME yet.
            // AuthScreen will call onLogin which will handle the navigation.
            const userData: User = {
              id: user.uid,
              name: user.displayName || 'User',
              phone: user.phoneNumber || '',
              avatar: user.photoURL || undefined,
              isAdmin: false,
            };
            setCurrentUser(userData);
            storage.save('currentUser', userData);
          }
          
          // Only auto-navigate if the document actually exists (persistence case)
          // or if we are already logged in and just refreshing
          if (currentScreen === 'AUTH' && userDoc.exists()) {
            setCurrentScreen('HOME');
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      } else {
        setCurrentUser(null);
        storage.save('currentUser', null);
        if (currentScreen !== 'AUTH') setCurrentScreen('AUTH');
      }
    });

    // 2. Listen for Products
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
      setProducts(list);
      storage.save('products_v1', list);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'products'));

    // 3. Listen for Categories
    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Category));
      setCategories(list);
      storage.save('categories_v1', list);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'categories'));

    // 4. Listen for Settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SystemSettings;
        setSystemSettings(data);
        storage.save('systemSettings_v3', data);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/global'));

    // 5. Listen for Orders (if logged in)
    let unsubOrders = () => {};
    if (currentUser) {
      const ordersQuery = currentUser.isAdmin 
        ? query(collection(db, 'orders'), orderBy('date', 'desc'))
        : query(collection(db, 'orders'), where('userId', '==', currentUser.id));
        
      unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
        setOrders(list);
        storage.save('orders_v1', list);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders'));
    }

    // 6. Listen for Coupons
    const unsubCoupons = onSnapshot(collection(db, 'coupons'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Coupon));
      setCoupons(list);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'coupons'));

    // 7. Listen for Special Offers
    const unsubSpecialOffers = onSnapshot(collection(db, 'specialOffers'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as SpecialOffer));
      setSpecialOffers(list);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'specialOffers'));

    return () => {
      unsubAuth();
      unsubProducts();
      unsubCategories();
      unsubSettings();
      unsubOrders();
      unsubCoupons();
      unsubSpecialOffers();
    };
  }, [currentUser]);

  // --- Handlers (Updated for Firebase) ---
  
  const handleUpdateSettings = async (newSettings: SystemSettings) => {
    setSystemSettings(newSettings);
    try {
      await setDoc(doc(db, 'settings', 'global'), newSettings);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/global');
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const cleanProduct = JSON.parse(JSON.stringify(updatedProduct));
      await updateDoc(doc(db, 'products', updatedProduct.id), cleanProduct);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${updatedProduct.id}`);
    }
  };

  const handleAddProduct = async (newProduct: Product) => {
    try {
      const cleanProduct = JSON.parse(JSON.stringify(newProduct));
      await setDoc(doc(db, 'products', newProduct.id), cleanProduct);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `products/${newProduct.id}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      if (currentScreen === 'PRODUCT_DETAIL') setCurrentScreen('HOME');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };
  
  const handleAddCategory = async (newCat: Category) => {
    try {
      await setDoc(doc(db, 'categories', newCat.id), newCat);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `categories/${newCat.id}`);
    }
  };
  
  const handleUpdateCategory = async (updatedCat: Category) => {
    try {
      const cleanCat = Object.fromEntries(
        Object.entries(updatedCat).filter(([_, v]) => v !== undefined)
      );
      await updateDoc(doc(db, 'categories', updatedCat.id), cleanCat);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `categories/${updatedCat.id}`);
    }
  };
  
  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    }
  };

  const handleAddCoupon = async (coupon: Coupon) => {
    try {
      const clean = JSON.parse(JSON.stringify(coupon));
      await setDoc(doc(db, 'coupons', coupon.id), clean);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `coupons/${coupon.id}`);
    }
  };

  const handleUpdateCoupon = async (coupon: Coupon) => {
    try {
      const clean = JSON.parse(JSON.stringify(coupon));
      await updateDoc(doc(db, 'coupons', coupon.id), clean);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `coupons/${coupon.id}`);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'coupons', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `coupons/${id}`);
    }
  };

  const handleAddSpecialOffer = async (offer: SpecialOffer) => {
    try {
      const clean = JSON.parse(JSON.stringify(offer));
      await setDoc(doc(db, 'specialOffers', offer.id), clean);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `specialOffers/${offer.id}`);
    }
  };

  const handleUpdateSpecialOffer = async (offer: SpecialOffer) => {
    try {
      const clean = JSON.parse(JSON.stringify(offer));
      await updateDoc(doc(db, 'specialOffers', offer.id), clean);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `specialOffers/${offer.id}`);
    }
  };

  const handleDeleteSpecialOffer = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'specialOffers', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `specialOffers/${id}`);
    }
  };
  
  const handleUpdateOrders = async (newOrders: Order[]) => {
    // This is a bit tricky since it's a list update in local state
    // In Firebase, we usually update individual orders
    setOrders(newOrders);
  };

  const handlePlaceOrder = async (method: PaymentMethod, details?: { phone?: string, trxId?: string }, address?: Address) => {
    if (!address) return;
    
    const newOrder: Order = { 
      id: `ORD-${Date.now()}`, 
      date: new Date().toISOString(), 
      total: cart.reduce((a,c)=>a+(c.price*c.quantity),0)+systemSettings.deliveryCharge, 
      status: 'PENDING' as OrderStatus, 
      itemsCount: cart.length, 
      items: cart.map(i=>({name:i.name, quantity:i.quantity, price:i.price})), 
      paymentMethod: method, 
      paymentDetails: details,
      deliveryAddress: address,
      userId: currentUser?.id || 'guest'
    };

    try {
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);
      setCart([]);
      setCurrentScreen('ORDERS');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `orders/${newOrder.id}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setCurrentUser(updatedUser);
    storage.save('currentUser', updatedUser);
    
    try {
      const cleanUser = JSON.parse(JSON.stringify(updatedUser));
      await updateDoc(doc(db, 'users', updatedUser.id), cleanUser);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${updatedUser.id}`);
    }
    
    // Also update the user in the global users list to persist changes across logins
    const users = storage.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    
    let updatedUsers;
    if (index !== -1) {
      updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    } else {
      // If user not in list (e.g. special admin/guest account), add them
      updatedUsers = [...users, updatedUser];
    }
    
    storage.save('users', updatedUsers);
  };

  const handleLogin = (user: User) => {
    // AuthScreen handles the actual Firebase login
    // This is just to update local state immediately if needed
    setCurrentUser(user);
    storage.save('currentUser', user);
    setCurrentScreen('HOME');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentScreen');
      localStorage.removeItem('selectedProduct');
      localStorage.removeItem('selectedOrderForTracking');
      setCurrentScreen('AUTH');
    } catch (err) {
      console.error("Logout error:", err);
    }
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

  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const handleSeedProducts = async () => {
    setIsSeeding(true);
    setSeedMessage(language === 'bn' ? 'পণ্য ইমপোর্ট হচ্ছে...' : 'Importing products...');
    
    try {
      const batch = writeBatch(db);
      for (const product of DUMMY_PRODUCTS) {
        const productRef = doc(db, 'products', product.id);
        // Firestore doesn't like undefined values, so we strip them
        const sanitizedProduct = JSON.parse(JSON.stringify(product));
        batch.set(productRef, sanitizedProduct);
      }
      
      for (const cat of CATEGORIES) {
        const catRef = doc(db, 'categories', cat.id);
        const sanitizedCat = JSON.parse(JSON.stringify(cat));
        batch.set(catRef, sanitizedCat);
      }

      await batch.commit();
      setSeedMessage(language === 'bn' ? 'পণ্য সফলভাবে ইমপোর্ট হয়েছে!' : 'Products imported successfully!');
      setTimeout(() => setSeedMessage(null), 3000);
    } catch (err) {
      console.error("Seeding error:", err);
      setSeedMessage(language === 'bn' ? 'ইমপোর্ট ব্যর্থ হয়েছে' : 'Import failed');
      setTimeout(() => setSeedMessage(null), 3000);
    } finally {
      setIsSeeding(false);
    }
  };

  const renderScreen = () => {
    const adminScreens: Screen[] = ['ADMIN_CONTROL', 'PRODUCT_MANAGEMENT', 'CATEGORY_MANAGEMENT', 'USER_MANAGEMENT'];
    const isActuallyAdmin = !!(currentUser?.isAdmin || currentUser?.phone === 'admin' || currentUser?.email === 'tamimshaon@gmail.com');
    
    if (adminScreens.includes(currentScreen) && !isActuallyAdmin) {
      return <HomeScreen products={products} categories={categories} recentlyViewed={products.filter(p => recentlyViewedIds.includes(p.id))} onProductClick={handleProductClick} onAddToCart={addToCart} onNavigate={setCurrentScreen} onCategoryClick={handleCategoryClick} lang={language} settings={systemSettings} />;
    }

    switch (currentScreen) {
      case 'AUTH': return <AuthScreen onLogin={handleLogin} settings={systemSettings} />;
      case 'HOME': return <HomeScreen products={products} categories={categories} recentlyViewed={products.filter(p => recentlyViewedIds.includes(p.id))} onProductClick={handleProductClick} onAddToCart={addToCart} onNavigate={setCurrentScreen} onCategoryClick={handleCategoryClick} lang={language} settings={systemSettings} />;
      case 'CATEGORIES': return <CategoryScreen products={products} categories={categories} onProductClick={handleProductClick} onAddToCart={addToCart} settings={systemSettings} initialCategoryId={targetCategory || undefined} />;
      case 'CART': return <CartScreen cart={cart} addresses={addresses} coupons={coupons} onUpdateQty={(id, d) => setCart(p => p.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity+d)} : i))} onRemove={id => setCart(p => p.filter(i => i.id !== id))} onClearCart={() => setCart([])} onPlaceOrder={handlePlaceOrder} onManageAddresses={() => setCurrentScreen('ADDRESS_LIST')} lang={language} isStoreOpen={systemSettings.isStoreOpen} deliveryCharge={systemSettings.deliveryCharge} supportPhone={systemSettings.supportPhone} />;
      case 'PROFILE': return <ProfileScreen currentUser={currentUser!} isAdmin={isActuallyAdmin} settings={systemSettings} onLogout={handleLogout} onUpdateUser={handleUpdateUser} onNavigate={setCurrentScreen} onShowLegal={(type) => { setLegalType(type); setCurrentScreen('LEGAL'); }} lang={language} />;
      case 'MESSAGES': return <MessagingScreen messages={messages} onSendMessage={handleSendMessage} isTyping={isTyping} onBack={() => setCurrentScreen('HOME')} lang={language} settings={systemSettings} />;
      case 'ORDERS': return <OrderListScreen orders={orders} isAdmin={isActuallyAdmin} onBack={() => setCurrentScreen('PROFILE')} onCancelOrder={id => handleUpdateOrderStatus(id, 'CANCELED')} onAcceptOrder={id => handleUpdateOrderStatus(id, 'ACCEPTED')} onTrackOrder={o => {setSelectedOrderForTracking(o); setCurrentScreen('TRACKING');}} lang={language} deliveryCharge={systemSettings.deliveryCharge} />;
      case 'TRACKING': return selectedOrderForTracking ? <TrackingScreen order={selectedOrderForTracking} isAdmin={isActuallyAdmin} onBack={() => setCurrentScreen('ORDERS')} onUpdateStatus={handleUpdateOrderStatus} /> : null;
      case 'SETTINGS': return <SettingsScreen isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} language={language} onSetLanguage={setLanguage} notifications={notificationsEnabled} onToggleNotifications={() => setNotificationsEnabled(!notificationsEnabled)} sounds={soundsEnabled} onToggleSounds={() => setSoundsEnabled(!soundsEnabled)} onBack={() => setCurrentScreen('PROFILE')} onLogout={handleLogout} isAdmin={isActuallyAdmin} onNavigate={setCurrentScreen} />;
      case 'PRODUCT_DETAIL': return selectedProduct ? <ProductDetailScreen product={selectedProduct} isAdmin={isActuallyAdmin} categories={categories} isFavorite={favorites.includes(selectedProduct.id)} onToggleFavorite={() => setFavorites(p=>p.includes(selectedProduct.id)?p.filter(i=>i!==selectedProduct.id):[...p,selectedProduct.id])} onAddToCart={addToCart} onBack={() => setCurrentScreen('HOME')} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} lang={language} settings={systemSettings} /> : null;
      case 'ADMIN_CONTROL': return <AdminControlScreen settings={systemSettings} products={products} orders={orders} onUpdateSettings={handleUpdateSettings} onBack={() => setCurrentScreen('PROFILE')} onNavigate={setCurrentScreen} onSeedProducts={handleSeedProducts} lang={language} />;
      case 'PRODUCT_MANAGEMENT': return <ProductManagementScreen products={products} categories={categories} settings={systemSettings} onBack={() => setCurrentScreen('ADMIN_CONTROL')} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} onNavigate={setCurrentScreen} onSeedProducts={handleSeedProducts} lang={language} />;
      case 'CATEGORY_MANAGEMENT': return <CategoryManagementScreen categories={categories} onBack={() => setCurrentScreen('ADMIN_CONTROL')} onAddCategory={handleAddCategory} onUpdateCategory={handleUpdateCategory} onDeleteCategory={handleDeleteCategory} lang={language} />;
      case 'USER_MANAGEMENT': return <UserManagementScreen onBack={() => setCurrentScreen('ADMIN_CONTROL')} lang={language} />;
      case 'ADDRESS_LIST': return <AddressListScreen addresses={addresses} onBack={() => setCurrentScreen('PROFILE')} onAddAddress={a=>setAddresses(p=>[...p,a])} onUpdateAddress={a=>setAddresses(p=>p.map(i=>i.id===a.id?a:i))} onDeleteAddress={id=>setAddresses(p=>p.filter(i=>i.id !== id))} onSetDefault={id=>setAddresses(p=>p.map(i=>({...i,isDefault:i.id===id})))} />;
      case 'BAZAR_CALCULATOR': return <BazarCalculatorScreen onBack={() => setCurrentScreen('PROFILE')} lang={language} />;
      case 'COUPONS': return <CouponScreen coupons={coupons} specialOffers={specialOffers} onBack={() => setCurrentScreen('HOME')} />;
      case 'COUPON_MANAGEMENT': return <CouponManagementScreen coupons={coupons} specialOffers={specialOffers} onBack={() => setCurrentScreen('ADMIN_CONTROL')} onAddCoupon={handleAddCoupon} onUpdateCoupon={handleUpdateCoupon} onDeleteCoupon={handleDeleteCoupon} onAddSpecialOffer={handleAddSpecialOffer} onUpdateSpecialOffer={handleUpdateSpecialOffer} onDeleteSpecialOffer={handleDeleteSpecialOffer} lang={language} />;
      case 'LEGAL': return <LegalScreen type={legalType} onBack={() => setCurrentScreen('PROFILE')} lang={language} />;
      default: return <HomeScreen products={products} categories={categories} recentlyViewed={[]} onProductClick={handleProductClick} onAddToCart={addToCart} onNavigate={setCurrentScreen} onCategoryClick={handleCategoryClick} lang={language} settings={systemSettings} />;
    }
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} logo={systemSettings.storeLogo} />;
  }

  const isTabScreen = ['HOME', 'CATEGORIES', 'CART', 'PROFILE', 'SETTINGS'].includes(currentScreen);
  const isNoScrollScreen = ['CATEGORIES', 'MESSAGES', 'CART'].includes(currentScreen);

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
          {seedMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-2xl animate-bounce border border-slate-800 flex items-center gap-3">
          {isSeeding && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
          {seedMessage}
        </div>
      )}
      {renderScreen()}
          {isTabScreen && !isNoScrollScreen && (
            <div className="py-8 px-6 text-center opacity-40">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                © {new Date().getFullYear()} {systemSettings.storeName}
              </p>
              <p className="text-[8px] font-bold text-slate-500 mt-1">
                All Rights Reserved. Developed by Ayat's Studio
              </p>
            </div>
          )}
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
