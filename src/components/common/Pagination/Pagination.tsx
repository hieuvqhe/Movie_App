import React from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = '' 
}) => {
  // Create array of page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // If total pages is less than max to show, display all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Calculate start and end of middle range
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at edges
      if (currentPage <= 3) {
        endPage = 4;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always include last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
      // Scroll to top when changing page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex justify-center items-center mt-6 ${className}`}>
      <div className="flex items-center space-x-1">
        {/* First Page Button */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 
                    disabled:opacity-50 disabled:cursor-not-allowed
                    hover:bg-gray-700 transition-colors"
          aria-label="First Page"
        >
          <FiChevronsLeft className="text-white" />
        </button>
        
        {/* Previous Page Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    hover:bg-gray-700 transition-colors"
          aria-label="Previous Page"
        >
          <FiChevronLeft className="text-white" />
        </button>
        
        {/* Page Numbers */}
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {typeof page === 'number' ? (
              <button
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500
                          ${page === currentPage 
                              ? 'bg-red-600 text-white' 
                              : 'text-gray-300 hover:bg-gray-700'
                          } transition-colors`}
                aria-current={page === currentPage ? 'page' : undefined}
                aria-label={`Page ${page}`}
              >
                {page}
              </button>
            ) : (
              <span className="w-10 h-10 flex items-center justify-center text-gray-400">
                {page}
              </span>
            )}
          </React.Fragment>
        ))}
        
        {/* Next Page Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    hover:bg-gray-700 transition-colors"
          aria-label="Next Page"
        >
          <FiChevronRight className="text-white" />
        </button>
        
        {/* Last Page Button */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    hover:bg-gray-700 transition-colors"
          aria-label="Last Page"
        >
          <FiChevronsRight className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
