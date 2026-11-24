import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.max(1, Math.min(currentPage, totalPages));

  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, safePage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const pageNumbers = getPageNumbers();

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const startItem = totalItems > 0 ? (safePage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(safePage * itemsPerPage, totalItems);

  return (
    <nav
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Navigasi halaman"
    >
      <p className="text-sm text-muted-foreground tabular-nums">
        {totalItems > 0 ? (
          <>
            Menampilkan <span className="font-medium text-foreground">{startItem}</span>–
            <span className="font-medium text-foreground">{endItem}</span> dari{' '}
            <span className="font-medium text-foreground">{totalItems}</span> data
          </>
        ) : (
          'Tidak ada data'
        )}
      </p>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageClick(safePage - 1)}
          disabled={safePage <= 1}
          className="gap-1 px-2.5"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          <span>Sebelumnya</span>
        </Button>

        <div className="hidden items-center gap-1 md:flex">
          {pageNumbers.map((page) => (
            <Button
              key={page}
              variant={page === safePage ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageClick(page)}
              aria-current={page === safePage ? 'page' : undefined}
              className={cn(
                'min-w-[32px] px-2.5 tabular-nums',
                page === safePage && 'pointer-events-none'
              )}
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageClick(safePage + 1)}
          disabled={safePage >= totalPages}
          className="gap-1 px-2.5"
        >
          <span>Selanjutnya</span>
          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </div>
    </nav>
  );
}
