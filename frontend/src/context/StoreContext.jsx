import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  // Theme state ('dark' or 'light')
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('bookworm_theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('bookworm_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  // Cart state
  const [cart, setCart] = useState({ items: [], total_items: 0, subtotal: 0, grand_total: 0 });
  const [loadingCart, setLoadingCart] = useState(false);

  // Navigation & View state
  const [currentView, setCurrentView] = useState('home'); // home, catalog, detail, checkout, orders
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState(['Home']);

  // Filters & Search state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    language: 'All',
    format: 'All',
    priceRange: 'All',
    sortBy: 'relevance',
  });

  // Toast / notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Auth fetch
  const fetchUser = async () => {
    try {
      const data = await api.getMe();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  // Cart fetch
  const fetchCart = async () => {
    try {
      setLoadingCart(true);
      const data = await api.getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoadingCart(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchCart();
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    setUser(res.user);
    await fetchCart();
    showToast(`Welcome back, ${res.user.full_name}!`);
    return res;
  };

  const register = async (fullName, email, password) => {
    const res = await api.register(fullName, email, password);
    setUser(res.user);
    await fetchCart();
    showToast('Account registered successfully! Welcome bonus 500 Gift Points added.');
    return res;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    await fetchCart();
    showToast('Logged out successfully', 'info');
  };

  const addToCart = async (bookId, qty = 1) => {
    try {
      const updatedCart = await api.addToCart(bookId, qty);
      setCart(updatedCart);
      showToast('Added to your basket!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const updateCartQty = async (itemId, qty) => {
    try {
      const updatedCart = await api.updateCartItem(itemId, qty);
      setCart(updatedCart);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const updatedCart = await api.removeCartItem(itemId);
      setCart(updatedCart);
      showToast('Item removed from basket', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const navigateToBook = (bookId, categoryName = 'Catalog') => {
    setSelectedBookId(bookId);
    setBreadcrumbs(['Home', categoryName]);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToView = (view, extraCrumbs = []) => {
    setCurrentView(view);
    if (view === 'home') setBreadcrumbs(['Home']);
    else if (view === 'catalog') setBreadcrumbs(['Home', 'Catalog']);
    else if (view === 'checkout') setBreadcrumbs(['Home', 'Checkout']);
    else if (view === 'orders') setBreadcrumbs(['Home', 'My Orders']);
    else if (extraCrumbs.length) setBreadcrumbs(extraCrumbs);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <StoreContext.Provider
      value={{
        theme,
        toggleTheme,
        user,
        loadingUser,
        login,
        register,
        logout,
        fetchUser,
        cart,
        loadingCart,
        addToCart,
        updateCartQty,
        removeFromCart,
        fetchCart,
        currentView,
        navigateToView,
        selectedBookId,
        navigateToBook,
        breadcrumbs,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        toast,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
