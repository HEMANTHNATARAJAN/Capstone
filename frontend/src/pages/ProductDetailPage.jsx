import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { 
  ShoppingCart, Heart, Star, Truck, Globe, Award, 
  ChevronRight, RefreshCw, Send, CheckCircle2 
} from 'lucide-react';

export default function ProductDetailPage() {
  const { selectedBookId, addToCart, navigateToBook, navigateToView, showToast, user } = useStore();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!selectedBookId) return;
      try {
        setLoading(true);
        const data = await api.getBookDetail(selectedBookId);
        setBook(data);
      } catch (err) {
        console.error('Failed to load book:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [selectedBookId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500 dark:text-gray-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2 text-blue-500" />
        <span>Loading book details...</span>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-400">
        <p>Book details could not be found.</p>
        <button
          onClick={() => navigateToView('catalog')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    try {
      setSubmittingReview(true);
      const newReview = await api.addReview(book.id, {
        rating: reviewRating,
        review_text: reviewText.trim(),
        user_name: user ? user.full_name : 'Verified Reader',
      });
      setBook(prev => ({
        ...prev,
        reviews: [newReview, ...prev.reviews],
      }));
      setReviewText('');
      showToast('Thank you for submitting your review!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
        <button onClick={() => navigateToView('home')} className="hover:text-blue-600 dark:hover:text-white transition">Home</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => navigateToView('catalog')} className="hover:text-blue-600 dark:hover:text-white transition">{book.category_name}</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 dark:text-gray-200 font-medium truncate max-w-xs">{book.title}</span>
      </nav>

      {/* Main Top Section Grid: Left details + Right "Related Reads" */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left & Center Columns (Product Showcase & Details) */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2b2b2b] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-sm dark:shadow-xl transition-colors duration-200">
            
            {/* Dual Cover Showcase (Front & Back) */}
            <div className="flex flex-row md:flex-col gap-3 justify-center items-center flex-shrink-0">
              <div className="w-40 sm:w-48 h-60 sm:h-72 bg-gray-100 dark:bg-[#222] rounded-xl overflow-hidden shadow-md dark:shadow-2xl border border-gray-200 dark:border-[#333]">
                {book.cover_image_url ? (
                  <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">{book.title}</div>
                )}
              </div>

              {book.back_cover_image_url && (
                <div className="w-40 sm:w-48 h-60 sm:h-72 bg-gray-100 dark:bg-[#222] rounded-xl overflow-hidden shadow-md dark:shadow-xl border border-gray-200 dark:border-[#333] hidden sm:block opacity-90 hover:opacity-100 transition">
                  <img src={book.back_cover_image_url} alt={`${book.title} Back`} className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Metadata & CTAs */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  {book.title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  by <span className="text-blue-600 dark:text-blue-400 font-semibold">{book.author_name}</span>
                </p>

                {book.publisher_name && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Published by: <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{book.publisher_name}</span>
                  </p>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs bg-gray-100 dark:bg-[#292929] text-gray-800 dark:text-gray-200 px-2.5 py-1 rounded-md border border-gray-200 dark:border-[#383838] font-medium">
                    {book.format}
                  </span>
                  <span className="text-xs bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800/40 font-medium">
                    {book.category_name}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-700 dark:text-gray-300 mt-4 leading-relaxed">
                  {book.description}
                </p>
              </div>

              {/* Price & Action Box */}
              <div className="mt-6 pt-5 border-t border-gray-200 dark:border-[#2a2a2a] space-y-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">₹{Math.round(book.price)}</span>
                    {book.original_price && (
                      <span className="text-sm text-gray-400 dark:text-gray-500 line-through">₹{Math.round(book.original_price)}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1 font-medium">
                    <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{book.tentative_delivery_date}</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => addToCart(book.id, 1)}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-md hover:shadow-blue-500/25 transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={() => showToast('Saved to your wishlist!')}
                    className="bg-gray-100 dark:bg-[#242424] hover:bg-gray-200 dark:hover:bg-[#2e2e2e] text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-3 px-4 rounded-xl text-sm border border-gray-300 dark:border-[#383838] transition flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4 text-red-500 dark:text-red-400" />
                    <span>Add to Wishlist</span>
                  </button>
                </div>

                {/* Quick Attributes */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-[#262626]">
                  <div>
                    <span className="block text-gray-400 dark:text-gray-500">Language</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{book.language}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 dark:text-gray-500">Rating</span>
                    <span className="font-semibold text-amber-500 dark:text-amber-400 flex items-center justify-center gap-0.5">
                      ★ {book.rating.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-400 dark:text-gray-500">Sells</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{book.sales_count} copies sold</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* About the Writer Section */}
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2b2b2b] rounded-2xl p-6 shadow-sm dark:shadow-md transition-colors duration-200">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">About the writer</h2>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg flex-shrink-0 border border-blue-500/20 overflow-hidden">
                {book.author?.photo_url ? (
                  <img src={book.author.photo_url} alt={book.author_name} className="w-full h-full object-cover" />
                ) : (
                  book.author_name.charAt(0)
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{book.author_name}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                  {book.about_author_summary || book.author?.bio || 'Author and contributor to modern literature.'}
                </p>
              </div>
            </div>
          </div>

          {/* Reviews & Leave Review Section */}
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2b2b2b] rounded-2xl p-6 shadow-sm dark:shadow-md space-y-6 transition-colors duration-200">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Reviews & Feedback</h2>
            
            {/* Review Input Box */}
            <form onSubmit={handleReviewSubmit} className="bg-gray-50 dark:bg-[#212121] border border-gray-200 dark:border-[#333] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Leave Your Review</span>
                <span className="text-[11px] text-gray-400">{reviewText.length}/100</span>
              </div>

              {/* Star selector */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition"
                  >
                    <Star className={`w-4 h-4 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                maxLength={100}
                required
                placeholder="Share your thoughts about this book (e.g. insightful concepts, well-structured delivery)..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full bg-white dark:bg-[#181818] text-xs text-gray-900 dark:text-white p-3 rounded-lg border border-gray-300 dark:border-[#3a3a3a] focus:outline-none focus:border-blue-500"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingReview || !reviewText.trim()}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span>Submit</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Existing Reviews List */}
            <div className="space-y-3">
              {book.reviews?.length > 0 ? (
                book.reviews.map((rev) => (
                  <div key={rev.id} className="bg-gray-50 dark:bg-[#202020] border border-gray-200 dark:border-[#2e2e2e] rounded-xl p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{rev.user_name}</span>
                      <div className="flex text-amber-400 text-xs">
                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">{rev.review_text}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">No reviews yet. Be the first to review this book!</p>
              )}
            </div>

          </div>

        </div>

        {/* Right Column: "Related Reads" Sidebar */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2b2b2b] rounded-2xl p-5 shadow-sm dark:shadow-lg transition-colors duration-200">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              Related Reads
            </h3>
            
            <div className="space-y-4">
              {book.related_reads?.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => navigateToBook(rel.id, rel.category_name)}
                  className="group bg-gray-50 dark:bg-[#212121] hover:bg-gray-100 dark:hover:bg-[#282828] border border-gray-200 dark:border-[#303030] rounded-xl p-3 flex gap-3 cursor-pointer transition shadow-sm"
                >
                  <div className="w-16 h-24 bg-gray-200 dark:bg-[#2b2b2b] rounded-lg overflow-hidden flex-shrink-0 shadow">
                    {rel.cover_image_url ? (
                      <img src={rel.cover_image_url} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">{rel.title}</div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                        {rel.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">by {rel.author_name}</p>
                      <span className="inline-block text-[10px] bg-gray-200 dark:bg-[#2d2d2d] text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded mt-1">
                        {rel.format}
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">₹{Math.round(rel.price)}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                        <Truck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span>{rel.tentative_delivery_date}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
