import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { 
  Package, Clock, RefreshCw, XCircle, RotateCcw, 
  CheckCircle2, ShoppingBag, ArrowRight 
} from 'lucide-react';

export default function OrdersPage({ onOpenAuth }) {
  const { user, fetchCart, showToast, navigateToView } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrderHistory();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order within the 48-hour policy window?')) {
      return;
    }
    try {
      setCancellingId(orderId);
      const res = await api.cancelOrder(orderId, 'Customer cancellation request');
      showToast('Order cancelled successfully. Refund initiated.');
      fetchOrders();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const handleBuyAgain = async (orderId) => {
    try {
      await api.buyAgain(orderId);
      await fetchCart();
      showToast('Items added back to your cart!');
      navigateToView('checkout');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20 bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#2b2b2b] rounded-2xl p-8 max-w-md mx-auto shadow-sm">
        <Package className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sign In to View Orders</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Access your order history, delivery tracking, and 48-hour order cancellation.</p>
        <button
          onClick={onOpenAuth}
          className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500 dark:text-gray-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2 text-blue-500" />
        <span>Loading order history...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Order History</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Track packages, reorder with <span className="text-blue-600 dark:text-blue-400 font-semibold">Buy It Again</span>, or cancel eligible orders within 48 hours.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-8 shadow-sm">
          <ShoppingBag className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No Orders Placed Yet</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">When you complete a purchase, your orders and tracking details will appear here.</p>
          <button
            onClick={() => navigateToView('catalog')}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow"
          >
            Explore Catalogue
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isCancelled = order.order_status === 'Cancelled';
            const placedDate = new Date(order.placed_at).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2b2b2b] rounded-2xl p-5 shadow-sm dark:shadow-lg space-y-4 transition-colors duration-200"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-[#282828] pb-3">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Order ID: </span>
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{order.order_number}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-3">Placed on {placedDate}</span>
                  </div>

                  {/* Status & 48h Window Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      isCancelled 
                        ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800/40' 
                        : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/40'
                    }`}>
                      {order.order_status}
                    </span>

                    {order.can_cancel && (
                      <span className="text-[11px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/40 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>48h Cancellation Active</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Items in this Order */}
                <div className="space-y-3">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-16 bg-gray-100 dark:bg-[#262626] rounded-md overflow-hidden flex-shrink-0">
                        {item.book_cover_image_url ? (
                          <img src={item.book_cover_image_url} alt={item.book_title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">{item.book_title}</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.book_title}</h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">by {item.book_author}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">Qty: {item.quantity} · ₹{Math.round(item.unit_price)} each</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">₹{Math.round(item.item_total)}</span>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{item.tentative_delivery_date}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Totals & Action Buttons (Buy It Again & Cancel) */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-[#282828]">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <span>Total Amount: </span>
                    <span className="text-sm font-extrabold text-gray-900 dark:text-white">₹{Math.round(order.total_amount)}</span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-2">({order.payment_method})</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Buy It Again Button */}
                    <button
                      onClick={() => handleBuyAgain(order.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Buy It Again</span>
                    </button>

                    {/* Cancel Order Button */}
                    {order.can_cancel && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingId === order.id}
                        className="px-4 py-2 bg-red-100 dark:bg-red-950/60 hover:bg-red-200 dark:hover:bg-red-900/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800/40 text-xs font-bold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{cancellingId === order.id ? 'Cancelling...' : 'Cancel Order (48h)'}</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
