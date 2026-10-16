import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Sparkles, User, Mail, Lock } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useStore();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(fullName, email, password);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('customer@bookworm.com');
    setPassword('password123');
    setIsRegister(false);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#282828] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-3 border border-blue-500/20">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {isRegister ? 'Join Book Worm' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {isRegister 
              ? 'Create an account to earn 500 Gift Points on signup' 
              : 'Sign in to access your order history and recommendations'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800/60 text-red-300 rounded-lg text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#242424] text-sm text-white px-3.5 py-2.5 rounded-lg border border-[#383838] focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#242424] text-sm text-white px-3.5 py-2.5 rounded-lg border border-[#383838] focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#242424] text-sm text-white px-3.5 py-2.5 rounded-lg border border-[#383838] focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-sm shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* Demo Fast Fill Button */}
        {!isRegister && (
          <div className="mt-4 pt-3 border-t border-[#2a2a2a] text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill Demo Credentials (customer@bookworm.com)</span>
            </button>
          </div>
        )}

        {/* Mode Switcher */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-xs text-gray-400 hover:text-gray-200"
          >
            {isRegister
              ? 'Already have an account? Sign In'
              : "Don't have an account? Create one"}
          </button>
        </div>

      </div>
    </div>
  );
}
