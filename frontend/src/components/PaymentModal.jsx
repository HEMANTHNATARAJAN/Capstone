import React, { useState } from 'react';
import { CreditCard, Smartphone, Wallet, X, ShieldCheck } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, payableAmount, onConfirmPayment, userPoints = 500 }) {
  const [activeTab, setActiveTab] = useState('credit_card');
  const [cardNumber, setCardNumber] = useState('4532-8821-9920-4102');
  const [cardName, setCardName] = useState('John Doe');
  const [cvv, setCvv] = useState('821');
  const [expiry, setExpiry] = useState('08/28');
  const [upiId, setUpiId] = useState('john.doe@okaxis');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePay = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onConfirmPayment({
        method: activeTab === 'credit_card' ? 'Credit Card' 
              : activeTab === 'debit_card' ? 'Debit Card' 
              : activeTab === 'upi' ? 'UPI' : 'Wallet Points',
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      {/* Background Graphic Illustration Overlay matching wireframe */}
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden relative animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="bg-[#222222] px-6 py-4 border-b border-[#2e2e2e] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Complete Payment</span>
              <ShieldCheck className="w-4 h-4 text-green-400" />
            </h2>
            <p className="text-xs text-gray-400">Secure 256-Bit Encrypted Transaction</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-gray-400 block">Payable Amount:</span>
              <span className="text-lg font-black text-blue-400">₹{Math.round(payableAmount)}</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#2e2e2e]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-3 min-h-[300px]">
          
          {/* Payment Method Tabs (Left Column) */}
          <div className="bg-[#161616] p-3 border-r border-[#2a2a2a] space-y-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('credit_card')}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
                activeTab === 'credit_card'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-[#202020] hover:text-gray-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Credit Card</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('debit_card')}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
                activeTab === 'debit_card'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-[#202020] hover:text-gray-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Debit Card</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upi')}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
                activeTab === 'upi'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-[#202020] hover:text-gray-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>UPI</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('wallet')}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
                activeTab === 'wallet'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-[#202020] hover:text-gray-200'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Wallet</span>
            </button>
          </div>

          {/* Form Content (Right 2 Columns) */}
          <div className="md:col-span-2 p-6 bg-[#1a1a1a] flex flex-col justify-between">
            <form onSubmit={handlePay} className="space-y-4">
              
              {/* Card Inputs */}
              {(activeTab === 'credit_card' || activeTab === 'debit_card') && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="w-full bg-[#242424] text-sm text-white px-3.5 py-2.5 rounded-lg border border-[#383838] focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Name on Card</label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Name"
                      className="w-full bg-[#242424] text-sm text-white px-3.5 py-2.5 rounded-lg border border-[#383838] focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">CVV</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="XXX"
                        className="w-full bg-[#242424] text-sm text-white px-3.5 py-2.5 rounded-lg border border-[#383838] focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Date of Expiry</label>
                      <input
                        type="text"
                        required
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="MM/YYYY"
                        className="w-full bg-[#242424] text-sm text-white px-3.5 py-2.5 rounded-lg border border-[#383838] focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* UPI Inputs */}
              {activeTab === 'upi' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Virtual Payment Address (VPA / UPI ID)</label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@upi"
                      className="w-full bg-[#242424] text-sm text-white px-3.5 py-2.5 rounded-lg border border-[#383838] focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    A payment request will be sent to your UPI app (Google Pay, PhonePe, Paytm).
                  </p>
                </div>
              )}

              {/* Wallet Points */}
              {activeTab === 'wallet' && (
                <div className="space-y-3 p-4 bg-[#222222] rounded-xl border border-[#333]">
                  <p className="text-xs font-semibold text-white">Book Worm Loyalty Balance</p>
                  <p className="text-sm font-bold text-amber-400">{userPoints} Gift Points (₹{userPoints}) Available</p>
                  <p className="text-xs text-gray-400">
                    Points will be debited towards the total amount upon confirmation.
                  </p>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm shadow-lg hover:shadow-blue-500/25 transition flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{submitting ? 'Processing Payment...' : `Pay Now  ₹${Math.round(payableAmount)}`}</span>
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
