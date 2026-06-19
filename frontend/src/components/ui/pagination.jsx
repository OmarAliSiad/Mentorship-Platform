import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages, onPageChange, className }) {
  if (totalPages <= 1) return null;

  const isFirst = page === 1;
  const isLast = page === totalPages;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('…start');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('…end');
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1.5 sm:gap-2', className)}
    >
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={isFirst}
        aria-label="Go to previous page"
        className={cn(
          'inline-flex h-9 items-center justify-center gap-1 rounded-full px-3 text-sm font-medium transition-colors',
          'border border-border/40 bg-transparent text-foreground/80 hover:bg-muted hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          isFirst && 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-foreground/80'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <div className="flex items-center gap-1 mx-1">
        {pageNumbers.map((p) =>
          typeof p === 'string' ? (
            <span
              key={p}
              className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground select-none"
              aria-hidden="true"
            >
              ···
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors select-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                p === page
                  ? 'bg-[#9f2d00] text-white shadow-sm border border-[#9f2d00]'
                  : 'border border-border/40 bg-transparent text-foreground/80 hover:bg-muted hover:text-foreground'
              )}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={isLast}
        aria-label="Go to next page"
        className={cn(
          'inline-flex h-9 items-center justify-center gap-1 rounded-full px-3 text-sm font-medium transition-colors',
          'border border-border/40 bg-transparent text-foreground/80 hover:bg-muted hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          isLast && 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-foreground/80'
        )}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
