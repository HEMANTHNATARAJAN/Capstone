import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import BookCard from '../components/BookCard';
import { Sparkles, TrendingUp, Rocket, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const { user } = useStore();
  const [recommended, setRecommended] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [newLaunches, setNewLaunches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [recData, bestData, newData] = await Promise.all([
          api.getRecommendedBooks(),
          api.getBestsellers(),
          api.getNewLaunches(),
        ]);
        setRecommended(recData);
        setBestsellers(bestData);
        setNewLaunches(newData);
      } catch (err) {
        console.error('Failed to load home books:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2 text-blue-500" />
        <span>Loading bookstore catalogue...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      
      {/* Recommended for You */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
              Recommended for You
            </h2>
          </div>
          {user && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Personalized based on your reading & order history
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommended.map((book) => (
            <BookCard key={`rec-${book.id}`} book={book} />
          ))}
        </div>
      </section>

      {/* Bestsellers this Month */}
      <section>
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
            Bestsellers this Month
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bestsellers.map((book) => (
            <BookCard key={`best-${book.id}`} book={book} />
          ))}
        </div>
      </section>

      {/* New Launches */}
      <section>
        <div className="flex items-center space-x-2 mb-4">
          <Rocket className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
            New Launches
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {newLaunches.map((book) => (
            <BookCard key={`new-${book.id}`} book={book} />
          ))}
        </div>
      </section>

    </div>
  );
}
