import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  BookOpen, Search, ShoppingBag, User as UserIcon, LogOut, 
  Heart, Feather, ChevronDown, Sparkles, Sun, Moon 
} from 'lucide-react';

export default function Navbar({ onOpenAuth }) {
  const { 
    user, logout, cart, currentView, navigateToView, 
    searchQuery, setSearchQuery, filters, setFilters,
    selectedCategory, setSelectedCategory,
    theme, toggleTheme 
  } = useStore();

  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (currentView !== 'catalog' && currentView !== 'home') {
      navigateToView('catalog');
    }
  };

  const handleFilterChange = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    if (currentView !== 'catalog') {
      navigateToView('catalog');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#161616] border-b border-gray-200 dark:border-[#262626] shadow-sm transition-colors duration-200">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => { setSelectedCategory('all'); navigateToView('home'); }}
            className="flex items-center space-x-2.5 cursor-pointer group flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:bg-blue-500 transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
              Book Worm
            </span>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600 dark:text-gray-300">
            <button 
              onClick={() => navigateToView('orders')}
              className={`hover:text-blue-600 dark:hover:text-white transition flex items-center space-x-1.5 ${currentView === 'orders' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''}`}
            >
              <span>My Orders</span>
            </button>
            <button 
              onClick={() => { navigateToView('catalog'); }}
              className="hover:text-blue-600 dark:hover:text-white transition flex items-center space-x-1.5"
            >
              <Heart className="w-4 h-4 text-red-500 dark:text-red-400" />
              <span>My Wishlist</span>
            </button>
            <button 
              onClick={() => { setSelectedCategory('all'); navigateToView('catalog'); }}
              className="hover:text-blue-600 dark:hover:text-white transition flex items-center space-x-1.5"
            >
              <Feather className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>My Writers</span>
            </button>
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-md relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search you want to read here..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-gray-100 dark:bg-[#202020] text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 pl-4 pr-10 py-2 rounded-lg border border-gray-300 dark:border-[#333333] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
            </div>
          </div>

          {/* Right Action Icons & Theme Toggle & Auth */}
          <div className="flex items-center space-x-3">
            
            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg transition"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 animate-in spin-in-180 duration-200" />
              ) : (
                <Moon className="w-5 h-5 text-blue-600 animate-in spin-in-180 duration-200" />
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => navigateToView('checkout')}
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg transition"
              title="Shopping Basket"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.total_items > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow">
                  {cart.total_items}
                </span>
              )}
            </button>

            {/* User Profile / Login */}
            <div className="relative">
              {user ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 bg-gray-100 dark:bg-[#222222] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] px-3 py-1.5 rounded-lg border border-gray-300 dark:border-[#333] transition"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                      {user.full_name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200 hidden sm:inline">
                      {user.full_name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 top-full w-56 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] rounded-xl shadow-2xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-[#2d2d2d]">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.email}</p>
                        <div className="mt-1 flex items-center space-x-1.5 text-xs text-amber-500 dark:text-amber-400">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{user.gift_points_balance} Gift Points</span>
                        </div>
                      </div>
                      <button
                        onClick={() => { setShowUserMenu(false); navigateToView('orders'); }}
                        className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#282828] hover:text-blue-600 dark:hover:text-white"
                      >
                        My Order History
                      </button>
                      <button
                        onClick={() => { setShowUserMenu(false); logout(); }}
                        className="w-full text-left px-4 py-2 text-xs text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-[#282828] flex items-center space-x-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Multi-Facet Filter Bar (Language, Format, Price Range, Sort By) */}
        <div className="py-2.5 border-t border-gray-200 dark:border-[#242424] flex items-center justify-between text-xs overflow-x-auto gap-3">
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Language */}
            <div className="flex items-center space-x-1.5">
              <span className="text-gray-500 dark:text-gray-400">Language:</span>
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="bg-gray-100 dark:bg-[#222] text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-[#333] rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="All">All</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="French">French</option>
              </select>
            </div>

            {/* Format */}
            <div className="flex items-center space-x-1.5">
              <span className="text-gray-500 dark:text-gray-400">Format:</span>
              <select
                value={filters.format}
                onChange={(e) => handleFilterChange('format', e.target.value)}
                className="bg-gray-100 dark:bg-[#222] text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-[#333] rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="All">All (Paperback, eBook, etc)</option>
                <option value="Paperback">Paperback</option>
                <option value="Hardcover">Hardcover</option>
                <option value="eBook">eBook</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="flex items-center space-x-1.5">
              <span className="text-gray-500 dark:text-gray-400">Price Range:</span>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="bg-gray-100 dark:bg-[#222] text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-[#333] rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="All">All</option>
                <option value="under200">Under ₹200</option>
                <option value="200to400">₹200 - ₹400</option>
                <option value="above400">Above ₹400</option>
              </select>
            </div>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <span className="text-gray-500 dark:text-gray-400">Sort by:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="bg-gray-100 dark:bg-[#222] text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-[#333] rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
