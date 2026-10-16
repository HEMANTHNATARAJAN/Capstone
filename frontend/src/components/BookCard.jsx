import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, Star, Truck } from 'lucide-react';

export default function BookCard({ book }) {
  const { navigateToBook, addToCart } = useStore();

  const handleCardClick = () => {
    navigateToBook(book.id, book.category_name);
  };

  const handleAddCart = (e) => {
    e.stopPropagation();
    addToCart(book.id, 1);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#202020] border border-gray-200 dark:border-[#2b2b2b] hover:border-gray-300 dark:hover:border-[#3b3b3b] rounded-xl p-3 flex gap-3.5 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-xl relative flex-col sm:flex-row"
    >
      {/* Book Cover Image */}
      <div className="w-full sm:w-28 sm:h-40 h-48 flex-shrink-0 bg-gray-100 dark:bg-[#242424] rounded-lg overflow-hidden relative shadow-md">
        {book.cover_image_url ? (
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 p-2 text-center">
            {book.title}
          </div>
        )}
      </div>

      {/* Book Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Title & Author */}
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate leading-snug">
            {book.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            by <span className="text-blue-600 dark:text-blue-400 font-medium hover:underline">{book.author_name}</span>
          </p>

          {/* Description snippet */}
          <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
            {book.subtitle || book.description}
          </p>

          {/* Badges / Format */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[10px] bg-gray-100 dark:bg-[#282828] text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded font-medium border border-gray-200 dark:border-[#333]">
              {book.format}
            </span>
            <span className="text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-medium border border-blue-200 dark:border-blue-800/40">
              {book.category_name}
            </span>
          </div>
        </div>

        {/* Price & Delivery & Action */}
        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-[#262626] flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-base font-extrabold text-gray-900 dark:text-white">
                ₹{Math.round(book.price)}
              </span>
              {book.original_price && (
                <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                  ₹{Math.round(book.original_price)}
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
              <Truck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>{book.tentative_delivery_date}</span>
            </p>
          </div>

          <button
            onClick={handleAddCart}
            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow hover:shadow-blue-500/30 transition flex items-center justify-center flex-shrink-0"
            title="Add to Basket"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
