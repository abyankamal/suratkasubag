import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
};

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

  // Calculate the range of items being shown
  const startItem = totalItems > 0 ? (safePage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(safePage * itemsPerPage, totalItems);

  return (
    <nav className="flex items-center justify-between px-4 py-3 sm:px-6" aria-label="Pagination">
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700">
          {totalItems > 0 ? (
            <>
              Menampilkan <span className="font-medium">{startItem}</span> hingga{" "}
              <span className="font-medium">{endItem}</span> dari{" "}
              <span className="font-medium">{totalItems}</span> data
            </>
          ) : (
            'Tidak ada data yang tersedia'
          )}
        </p>
      </div>
      
      <div className="flex flex-1 justify-between sm:justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageClick(safePage - 1)}
          disabled={safePage <= 1}
          className={cn(
            "relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium",
            safePage <= 1 && "cursor-not-allowed opacity-50"
          )}
        >
          Sebelumnya
        </Button>

        <div className="hidden md:flex mx-2 space-x-1">
          {pageNumbers.map((page) => (
            <Button
              key={page}
              variant={page === safePage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageClick(page)}
              className={cn(
                "relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md",
                page === safePage && "z-10"
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
          className={cn(
            "relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-medium",
            safePage >= totalPages && "cursor-not-allowed opacity-50"
          )}
        >
          Selanjutnya
        </Button>
      </div>
    </nav>
  );
}
