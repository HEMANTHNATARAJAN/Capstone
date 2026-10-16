import React from 'react';
import { useStore } from '../context/StoreContext';

const GENRES = [
  { name: 'All', slug: 'all' },
  { name: 'Romance', slug: 'romance' },
  { name: 'Mystery', slug: 'mystery' },
  { name: 'Science Fiction', slug: 'science-fiction' },
  { name: 'Fantasy', slug: 'fantasy' },
  { name: 'Historical', slug: 'historical' },
  { name: 'Biography', slug: 'biography' },
  { name: 'Self-help', slug: 'self-help' },
  { name: 'Memoir', slug: 'memoir' },
  { name: 'Travel', slug: 'travel' },
  { name: 'Cooking', slug: 'cooking' },
  { name: 'Children\'s', slug: 'childrens' },
  { name: 'Young Adult', slug: 'young-adult' },
  { name: 'Comics & Graphic Novels', slug: 'comics-graphic-novels' },
  { name: 'Poetry', slug: 'poetry' },
  { name: 'Drama', slug: 'drama' },
  { name: 'Science', slug: 'science' },
  { name: 'Philosophy', slug: 'philosophy' },
  { name: 'Religion', slug: 'religion' },
  { name: 'Language Learning', slug: 'language-learning' },
];

export default function Sidebar() {
  const { selectedCategory, setSelectedCategory, currentView, navigateToView } = useStore();

  const handleSelectGenre = (slug) => {
    setSelectedCategory(slug);
    if (currentView !== 'catalog') {
      navigateToView('catalog');
    }
  };

  return (
    <aside className="w-56 flex-shrink-0 bg-white dark:bg-[#151515] border-r border-gray-200 dark:border-[#242424] py-4 hidden lg:block sticky top-28 h-[calc(100vh-7rem)] overflow-y-auto rounded-xl shadow-sm transition-colors duration-200">
      <div className="px-3 mb-2">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2">
          Categories
        </h2>
      </div>
      <nav className="space-y-0.5 px-2">
        {GENRES.map((genre) => {
          const isActive = selectedCategory === genre.slug;
          return (
            <button
              key={genre.slug}
              onClick={() => handleSelectGenre(genre.slug)}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center justify-between ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#202020] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="truncate">{genre.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
