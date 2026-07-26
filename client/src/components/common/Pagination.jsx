import Button from './Button';

/**
 * Pagination Component
 * Accessible pagination controls with page numbers, prev/next buttons, and ARIA attributes.
 */
export default function Pagination({
  page = 1,
  totalPages = 1,
  onPageChange,
  className = '',
}) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxButtons = 5;
  let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i += 1) {
    pages.push(i);
  }

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`flex items-center justify-center gap-2 pt-6 ${className}`}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Go to previous page"
      >
        ◀ Prev
      </Button>

      {startPage > 1 && (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            aria-label="Page 1"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              page === 1
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            1
          </button>
          {startPage > 2 && <span className="text-slate-500 text-xs select-none">...</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          aria-label={`Page ${p}`}
          aria-current={p === page ? 'page' : undefined}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            p === page
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          {p}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-slate-500 text-xs select-none">...</span>}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            aria-label={`Page ${totalPages}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              page === totalPages
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {totalPages}
          </button>
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="Go to next page"
      >
        Next ▶
      </Button>
    </nav>
  );
}
