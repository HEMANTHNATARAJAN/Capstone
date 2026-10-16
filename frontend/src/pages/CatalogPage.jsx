import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import BookCard from '../components/BookCard';
import { Search, RefreshCw, SlidersHorizontal } from 'lucide-react';

export default function CatalogPage() {
  const { selectedCategory, searchQuery, filters } = useStore();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalogBooks = async () => {
      try {
        setLoading(true);
        let minPrice = undefined;
        let maxPrice = undefined;

        if (filters.priceRange === 'under200') {
          minPrice = 0;
          maxPrice = 200;
        } else if (filters.priceRange === '200to400') {
          minPrice = 200;
          maxPrice = 400;
        } else if (filters.priceRange === 'above400') {
          minPrice = 400;
        }

        const data = await api.getBooks({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          search: searchQuery || undefined,
          language: filters.language === 'All' ? undefined : filters.language,
          format: filters.format === 'All' ? undefined : filters.format,
          min_price: minPrice,
          max_price: maxPrice,
          sort_by: filters.sortBy,
        });
        setBooks(data);
      } catch (err) {
        console.error('Failed to filter books:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogBooks();
  }, [selectedCategory, searchQuery, filters]);

  return (
    <div className="space-y-6 pb-12">
      {/* Category Title & Count */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#242424] pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
            {selectedCategory === 'all' ? 'All Books Collection' : `${selectedCategory.replace('-', ' ')} Books`}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Showing {books.length} {books.length === 1 ? 'book' : 'books'} matching your criteria
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500 dark:text-gray-400">
          <RefreshCw className="w-6 h-6 animate-spin mr-2 text-blue-500" />
          <span>Updating catalogue...</span>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#181818] rounded-2xl border border-gray-200 dark:border-[#2b2b2b] p-8 shadow-sm">
          <Search className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No books found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, removing format filters, or picking another genre from the sidebar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
