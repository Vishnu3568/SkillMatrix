import { useState, useEffect } from 'react';

/**
 * SearchInput Component
 * Debounced search input with clear icon and ARIA accessibility labels.
 */
export default function SearchInput({
  value = '',
  onChange,
  placeholder = 'Search by title, description, or tags...',
  debounceMs = 300,
  className = '',
  id = 'search-input',
  label = 'Search Courses',
}) {
  const [term, setTerm] = useState(value);

  useEffect(() => {
    setTerm(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (term !== value && onChange) {
        onChange(term);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [term, value, onChange, debounceMs]);

  const handleClear = () => {
    setTerm('');
    if (onChange) onChange('');
  };

  return (
    <div className={`relative w-full ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        🔍
      </div>
      <input
        id={id}
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 text-slate-100 placeholder-slate-400 text-sm font-medium rounded-xl border border-slate-700/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-inner"
      />
      {term && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}
