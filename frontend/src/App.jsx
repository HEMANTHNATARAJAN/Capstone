import React, { useState } from 'react';
import { useStore } from './context/StoreContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';

import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';

export default function App() {
  const { currentView } = useStore();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const showSidebar = currentView === 'home' || currentView === 'catalog';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar onOpenAuth={() => setShowAuthModal(true)} />

      {/* Main Container Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex w-full gap-6 mt-6">
        
        {/* Left Genre Sidebar */}
        {showSidebar && <Sidebar />}

        {/* Dynamic Center Stage Content */}
        <main className="flex-1 min-w-0">
          {currentView === 'home' && <HomePage />}
          {currentView === 'catalog' && <CatalogPage />}
          {currentView === 'detail' && <ProductDetailPage />}
          {currentView === 'checkout' && <CheckoutPage onOpenAuth={() => setShowAuthModal(true)} />}
          {currentView === 'orders' && <OrdersPage onOpenAuth={() => setShowAuthModal(true)} />}
        </main>

      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#151515] border-t border-gray-200 dark:border-[#222222] py-6 text-center text-xs text-gray-500 transition-colors duration-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Book Worm Online Bookstore. Powered by IBM Bob.</p>
          <div className="flex items-center space-x-6 text-gray-500 dark:text-gray-400">
            <span>Free Shipping on All Orders</span>
            <span>48h Return/Cancellation Policy</span>
            <span>256-Bit Encrypted Payments</span>
          </div>
        </div>
      </footer>

      {/* Global Modals & Toast */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <Toast />

    </div>
  );
}
