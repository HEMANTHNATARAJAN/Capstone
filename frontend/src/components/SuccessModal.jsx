import React from 'react';
import { Check, ShoppingBag, ArrowRight } from 'lucide-react';

export default function SuccessModal({ isOpen, order, onContinueShopping }) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#1c1c1c] border border-[#2f2f2f] rounded-2xl w-full max-w-xl p-6 md:p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200">
        
        {/* Green Checkmark Badge */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-extrabold text-white leading-tight">
          Your purchase of the following reads is successful
        </h2>
        <p className="text-xs text-gray-400 mt-1.5">
          Order Number: <span className="font-mono text-blue-400 font-semibold">{order.order_number}</span>
        </p>

        {/* Purchased Items List */}
        <div className="mt-6 space-y-3 max-h-64 overflow-y-auto pr-1 text-left">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="bg-[#242424] border border-[#333] rounded-xl p-3 flex items-center gap-4"
            >
              {/* Cover */}
              <div className="w-14 h-20 bg-[#2c2c2c] rounded-md overflow-hidden flex-shrink-0 shadow">
                {item.book_cover_image_url ? (
                  <img
                    src={item.book_cover_image_url}
                    alt={item.book_title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 text-center">
                    {item.book_title}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{item.book_title}</h4>
                <p className="text-xs text-gray-400">by <span className="text-blue-400">{item.book_author}</span></p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-[#333] text-gray-300 px-2 py-0.5 rounded font-medium">
                    {item.book_format} (x{item.quantity})
                  </span>
                  <span className="text-xs font-bold text-white">₹{Math.round(item.unit_price * item.quantity)}</span>
                </div>
                <p className="text-[11px] text-emerald-400 font-medium mt-1">
                  {item.tentative_delivery_date || 'Delivery by Mon, 21 Jul'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-[#2a2a2a]">
          <button
            onClick={onContinueShopping}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-blue-500/25 transition inline-flex items-center justify-center gap-2"
          >
            <span>Continue your Shopping</span>
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
