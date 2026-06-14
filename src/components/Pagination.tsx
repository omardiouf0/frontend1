/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  if (totalPages <= 1) return null;

  // Generate page numbers array with ellipses if needed
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Distances
      const leftBound = Math.max(2, currentPage - 1);
      const rightBound = Math.min(totalPages - 1, currentPage + 1);

      if (leftBound > 2) {
        pages.push('...');
      }

      for (let i = leftBound; i <= rightBound; i++) {
        pages.push(i);
      }

      if (rightBound < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const startIndex = itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = itemsPerPage && totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-white border-t border-slate-100 rounded-b-xl select-none">
      {/* Items status summary */}
      {totalItems !== undefined && itemsPerPage !== undefined && (
        <span className="text-xs text-slate-500 font-medium">
          Affichage de <span className="font-semibold text-slate-850">{startIndex}</span> à{' '}
          <span className="font-semibold text-slate-850">{endIndex}</span> sur{' '}
          <span className="font-semibold text-slate-850">{totalItems}</span> éléments
        </span>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-1.5 ml-auto">
        {/* Go to First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-colors cursor-pointer"
          title="Première page"
        >
          <ChevronsLeft size={15} />
        </button>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-colors cursor-pointer"
          title="Page précédente"
        >
          <ChevronLeft size={15} />
        </button>

        {/* Page list */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2.5 py-1 text-xs text-slate-400 font-medium select-none"
                >
                  ...
                </span>
              );
            }

            const isCurrent = page === currentPage;
            return (
              <button
                key={`page-${page}`}
                onClick={() => onPageChange(page as number)}
                className={`min-w-8 text-center px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-brand-blue text-white shadow-3xs hover:bg-brand-blue/90'
                    : 'border border-slate-202 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-colors cursor-pointer"
          title="Page suivante"
        >
          <ChevronRight size={15} />
        </button>

        {/* Go to Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-colors cursor-pointer"
          title="Dernière page"
        >
          <ChevronsRight size={15} />
        </button>
      </div>
    </div>
  );
};
