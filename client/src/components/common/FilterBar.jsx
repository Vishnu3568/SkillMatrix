import SearchInput from './SearchInput';
import Select from './Select';
import Button from './Button';

/**
 * FilterBar Component
 * Composite filter toolbar with debounced search, category/level selects, sort options, and active filter chips.
 */
export default function FilterBar({
  search = '',
  onSearchChange,
  category = '',
  onCategoryChange,
  level = '',
  onLevelChange,
  sort = 'newest',
  onSortChange,
  categories = [],
  onClearFilters,
  className = '',
}) {
  const levelOptions = [
    { value: '', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'most_enrolled', label: 'Most Enrolled' },
    { value: 'highest_completion', label: 'Highest Completion' },
    { value: 'alphabetical', label: 'Title (A-Z)' },
    { value: 'alphabetical_desc', label: 'Title (Z-A)' },
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  const hasActiveFilters = Boolean(search || category || level || (sort && sort !== 'newest'));

  return (
    <div className={`space-y-4 bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80 shadow-lg ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
        {/* Search Input */}
        <div className="md:col-span-5">
          <SearchInput value={search} onChange={onSearchChange} />
        </div>

        {/* Category Select */}
        <div className="md:col-span-3">
          <Select
            id="filter-category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            options={categoryOptions}
            aria-label="Filter by Category"
          />
        </div>

        {/* Level Select */}
        <div className="md:col-span-2">
          <Select
            id="filter-level"
            value={level}
            onChange={(e) => onLevelChange(e.target.value)}
            options={levelOptions}
            aria-label="Filter by Level"
          />
        </div>

        {/* Sort Select */}
        <div className="md:col-span-2">
          <Select
            id="filter-sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            options={sortOptions}
            aria-label="Sort Courses"
          />
        </div>
      </div>

      {/* Active Filter Chips & Clear Action */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/60 flex-wrap text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-bold">Active Filters:</span>

            {search && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-semibold">
                Search: &quot;{search}&quot;
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="hover:text-white font-bold"
                  aria-label="Remove search filter"
                >
                  ✕
                </button>
              </span>
            )}

            {category && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                Category: {category}
                <button
                  type="button"
                  onClick={() => onCategoryChange('')}
                  className="hover:text-white font-bold"
                  aria-label="Remove category filter"
                >
                  ✕
                </button>
              </span>
            )}

            {level && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 font-semibold capitalize">
                Level: {level}
                <button
                  type="button"
                  onClick={() => onLevelChange('')}
                  className="hover:text-white font-bold"
                  aria-label="Remove level filter"
                >
                  ✕
                </button>
              </span>
            )}

            {sort && sort !== 'newest' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">
                Sort: {sortOptions.find((s) => s.value === sort)?.label || sort}
                <button
                  type="button"
                  onClick={() => onSortChange('newest')}
                  className="hover:text-white font-bold"
                  aria-label="Reset sort order"
                >
                  ✕
                </button>
              </span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-[11px] py-1 px-2.5"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}
