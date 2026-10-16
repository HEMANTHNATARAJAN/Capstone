import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import PaymentModal from '../components/PaymentModal';
import SuccessModal from '../components/SuccessModal';
import { 
  ShoppingBag, Trash2, Plus, Minus, Tag, Truck, 
  CreditCard, Sparkles, MapPin, ArrowRight 
} from 'lucide-react';

export default function CheckoutPage({ onOpenAuth }) {
  const { cart, updateCartQty, removeFromCart, user, fetchCart, showToast, navigateToView } = useStore();
  
  // Address state
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    addressLine: '',
    email: '',
    city: '',
    pinCode: '',
    phone: '',
    state: 'Karnataka',
    country: 'India',
  });

  // Coupon / Points state
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [useGiftPoints, setUseGiftPoints] = useState(false);

  // Modals state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Pre-fill user data if available
  useEffect(() => {
    if (user) {
      setAddress(prev => ({
        ...prev,
        firstName: user.full_name?.split(' ')[0] || '',
        lastName: user.full_name?.split(' ')[1] || '',
        email: user.email || '',
      }));
      if (user.addresses?.length > 0) {
        const defaultAddr = user.addresses.find(a => a.is_default) || user.addresses[0];
        setAddress(prev => ({
          ...prev,
          firstName: defaultAddr.first_name,
          lastName: defaultAddr.last_name,
          addressLine: defaultAddr.address_line,
          city: defaultAddr.city,
          state: defaultAddr.state,
          pinCode: defaultAddr.pin_code,
          phone: defaultAddr.phone,
          country: defaultAddr.country,
        }));
        setUseSavedAddress(true);
      }
    }
  }, [user]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      const res = await api.validateCoupon(couponCode.trim(), cart.subtotal);
      if (res.valid) {
        setCouponDiscount(res.discount_amount);
        setAppliedCoupon(res.code);
        showToast(res.message);
      } else {
        showToast(res.message, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUseSavedToggle = (e) => {
    const checked = e.target.checked;
    setUseSavedAddress(checked);
    if (checked && user?.addresses?.length > 0) {
      const addr = user.addresses[0];
      setAddress({
        firstName: addr.first_name,
        lastName: addr.last_name,
        addressLine: addr.address_line,
        email: user.email,
        city: addr.city,
        pinCode: addr.pin_code,
        phone: addr.phone,
        state: addr.state,
        country: addr.country,
      });
    }
  };

  // Calculations
  const tax = Math.round(cart.subtotal * 0.12);
  const deliveryCharges = 0; // Free
  const totalDiscount = couponDiscount + (useGiftPoints ? Math.min(100, user?.gift_points_balance || 0) : 0);
  const grandTotal = Math.max(0, cart.subtotal + tax + deliveryCharges - totalDiscount);

  const handleInitiatePayment = () => {
    if (!user) {
      showToast('Please sign in to proceed with checkout', 'info');
      onOpenAuth();
      return;
    }
    if (!address.firstName || !address.addressLine || !address.city || !address.pinCode) {
      showToast('Please fill in complete delivery address details', 'error');
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async (paymentDetails) => {
    try {
      const orderPayload = {
        shipping_address: {
          first_name: address.firstName,
          last_name: address.lastName || '',
          address_line: address.addressLine,
          city: address.city,
          state: address.state,
          pin_code: address.pinCode,
          phone: address.phone,
          country: address.country,
          save_address: !useSavedAddress,
        },
        payment_method: paymentDetails.method,
        coupon_code: appliedCoupon,
        use_gift_points: useGiftPoints,
        gift_points_to_redeem: useGiftPoints ? Math.min(100, user?.gift_points_balance || 0) : 0,
      };

      const orderResult = await api.checkout(orderPayload);
      setShowPaymentModal(false);
      setCompletedOrder(orderResult);
      setShowSuccessModal(true);
      await fetchCart();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (cart.items.length === 0 && !completedOrder) {
    return (
      <div className="text-center py-20 bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#2c2c2c] rounded-2xl p-8 max-w-lg mx-auto shadow-sm">
        <ShoppingBag className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Shopping Basket is Empty</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Explore our catalog and find your next favorite book.</p>
        <button
          onClick={() => navigateToView('catalog')}
          className="mt-5 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition shadow"
        >
          Browse Catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Shopping Cart & Checkout</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Review your basket, delivery details, and payment options</p>
      </div>

      {/* Top: Cart Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2d2d2d] rounded-2xl p-4 flex gap-4 items-center shadow-sm dark:shadow-md relative transition-colors duration-200"
          >
            {/* Cover */}
            <div className="w-20 h-28 bg-gray-100 dark:bg-[#282828] rounded-xl overflow-hidden flex-shrink-0 shadow">
              {item.book.cover_image_url ? (
                <img src={item.book.cover_image_url} alt={item.book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">{item.book.title}</div>
              )}
            </div>

            {/* Info & Quantity Stepper */}
            <div className="flex-1 min-w-0 flex flex-col justify-between h-28">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.book.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">by <span className="text-blue-600 dark:text-blue-400">{item.book.author_name}</span></p>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded border border-gray-200 dark:border-transparent">
                    {item.book.format}
                  </span>
                  <span className="text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                    {item.book.category_name}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-sm font-extrabold text-gray-900 dark:text-white">₹{Math.round(item.item_total)}</span>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Truck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>{item.book.tentative_delivery_date}</span>
                  </p>
                </div>

                {/* Stepper (- 1 +) */}
                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-[#262626] border border-gray-300 dark:border-[#383838] rounded-lg px-2 py-1">
                  <button
                    onClick={() => updateCartQty(item.id, item.quantity - 1)}
                    className="p-1 hover:text-red-500 text-gray-500 dark:text-gray-400 transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-gray-900 dark:text-white px-1.5">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQty(item.id, item.quantity + 1)}
                    className="p-1 hover:text-green-500 text-gray-500 dark:text-gray-400 transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Remove */}
            <button
              onClick={() => removeFromCart(item.id)}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-1 transition"
              title="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Section: Left Address Form + Right Grand Total */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left (Address Form) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2b2b2b] rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-200">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2a2a2a] pb-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Delivery Address</span>
            </h2>

            {user && (
              <label className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useSavedAddress}
                  onChange={handleUseSavedToggle}
                  className="rounded bg-gray-100 dark:bg-[#282828] border-gray-300 dark:border-[#444] text-blue-600 focus:ring-0"
                />
                <span>Use Saved Address</span>
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
              <input
                type="text"
                placeholder="First Name"
                value={address.firstName}
                onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
                className="w-full bg-gray-50 dark:bg-[#222] text-xs text-gray-900 dark:text-white p-2.5 rounded-lg border border-gray-300 dark:border-[#333] focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
              <input
                type="text"
                placeholder="Last Name"
                value={address.lastName}
                onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
                className="w-full bg-gray-50 dark:bg-[#222] text-xs text-gray-900 dark:text-white p-2.5 rounded-lg border border-gray-300 dark:border-[#333] focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <input
                type="text"
                placeholder="Address Line (Street, Flat, Landmark)"
                value={address.addressLine}
                onChange={(e) => setAddress({ ...address, addressLine: e.target.value })}
                className="w-full bg-gray-50 dark:bg-[#222] text-xs text-gray-900 dark:text-white p-2.5 rounded-lg border border-gray-300 dark:border-[#333] focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
              <input
                type="email"
                placeholder="e-mail"
                value={address.email}
                onChange={(e) => setAddress({ ...address, email: e.target.value })}
                className="w-full bg-gray-50 dark:bg-[#222] text-xs text-gray-900 dark:text-white p-2.5 rounded-lg border border-gray-300 dark:border-[#333] focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
              <input
                type="text"
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="w-full bg-gray-50 dark:bg-[#222] text-xs text-gray-900 dark:text-white p-2.5 rounded-lg border border-gray-300 dark:border-[#333] focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">PIN Code</label>
              <input
                type="text"
                placeholder="000000"
                value={address.pinCode}
                onChange={(e) => setAddress({ ...address, pinCode: e.target.value })}
                className="w-full bg-gray-50 dark:bg-[#222] text-xs text-gray-900 dark:text-white p-2.5 rounded-lg border border-gray-300 dark:border-[#333] focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <div className="flex">
                <span className="bg-gray-100 dark:bg-[#2a2a2a] text-xs text-gray-600 dark:text-gray-400 px-3 py-2.5 rounded-l-lg border border-r-0 border-gray-300 dark:border-[#333]">
                  +91
                </span>
                <input
                  type="text"
                  placeholder="1234567890"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-[#222] text-xs text-gray-900 dark:text-white p-2.5 rounded-r-lg border border-gray-300 dark:border-[#333] focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
              <input
                type="text"
                placeholder="State"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                className="w-full bg-gray-50 dark:bg-[#222] text-xs text-gray-900 dark:text-white p-2.5 rounded-lg border border-gray-300 dark:border-[#333] focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
              <select
                value={address.country}
                onChange={(e) => setAddress({ ...address, country: e.target.value })}
                className="w-full bg-gray-50 dark:bg-[#222] text-xs text-gray-900 dark:text-white p-2.5 rounded-lg border border-gray-300 dark:border-[#333] focus:border-blue-500 focus:outline-none"
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right (Grand Total & Coupon Summary) */}
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2b2b2b] rounded-2xl p-6 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors duration-200">
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-[#282828]">
              Grand Total
            </h2>

            {/* Calculations Breakdown matching wireframe */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Price ({cart.total_items} items)</span>
                <span className="font-semibold text-gray-900 dark:text-white">₹{cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Tax (12% GST)</span>
                <span className="font-semibold text-gray-900 dark:text-white">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Delivery Charges</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Free</span>
              </div>
            </div>

            {/* Coupon input */}
            <form onSubmit={handleApplyCoupon} className="pt-3 border-t border-gray-200 dark:border-[#282828]">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Apply Coupon / Promo</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME100"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-gray-50 dark:bg-[#222] text-xs text-gray-900 dark:text-white px-3 py-2 rounded-lg border border-gray-300 dark:border-[#383838] focus:border-blue-500 focus:outline-none uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
                >
                  Apply
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Try coupon code: <span className="text-blue-600 dark:text-blue-400 font-mono font-semibold">WELCOME100</span> (₹100 Off)</p>
            </form>

            {/* Gift Points Toggle */}
            {user && user.gift_points_balance > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-[#222222] rounded-xl border border-gray-200 dark:border-[#333] flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Redeem 100 Gift Points (₹100)</span>
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Balance: {user.gift_points_balance} pts</p>
                </div>
                <input
                  type="checkbox"
                  checked={useGiftPoints}
                  onChange={(e) => setUseGiftPoints(e.target.checked)}
                  className="rounded bg-gray-100 dark:bg-[#333] border-gray-300 dark:border-[#555] text-amber-500 focus:ring-0"
                />
              </div>
            )}

            {/* Discounts */}
            {totalDiscount > 0 && (
              <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-2 border-t border-gray-200 dark:border-[#282828]">
                <span>Discount</span>
                <span>-₹{totalDiscount.toFixed(2)}</span>
              </div>
            )}

            {/* Total Amount */}
            <div className="flex justify-between items-baseline pt-3 border-t border-gray-200 dark:border-[#282828]">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Total Amount</span>
              <span className="text-2xl font-black text-gray-900 dark:text-white">₹{Math.round(grandTotal)}</span>
            </div>
          </div>

          {/* Pay Now Button */}
          <div className="pt-6">
            <button
              onClick={handleInitiatePayment}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3.5 rounded-xl text-sm shadow-md hover:shadow-blue-500/25 transition flex items-center justify-center gap-2"
            >
              <span>Pay Now</span>
              <CreditCard className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        payableAmount={grandTotal}
        onConfirmPayment={handleConfirmPayment}
        userPoints={user?.gift_points_balance || 0}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        order={completedOrder}
        onContinueShopping={() => {
          setShowSuccessModal(false);
          navigateToView('home');
        }}
      />

    </div>
  );
}
