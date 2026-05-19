"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { cn } from "@/shared/lib/utils";

type PaginationControlProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isDisabled?: boolean;
};

const PAGE_WINDOW_SIZE = 10;

function getPaginationItems(page: number, totalPages: number) {
  const startPage = Math.floor((page - 1) / PAGE_WINDOW_SIZE) * PAGE_WINDOW_SIZE + 1;
  const endPage = Math.min(startPage + PAGE_WINDOW_SIZE - 1, totalPages);

  return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
}

export function PaginationControl({
  page,
  totalPages,
  onPageChange,
  isDisabled = false,
}: PaginationControlProps) {
  const safeTotalPages = Math.max(totalPages, 1);

  if (safeTotalPages <= 1) {
    return null;
  }

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > safeTotalPages || nextPage === page || isDisabled) {
      return;
    }

    onPageChange(nextPage);
  };

  return (
    <nav aria-label="페이지" className="-mx-5 mt-5 overflow-x-auto px-5">
      <div className="flex min-w-max items-center justify-center gap-2">
        <button
          aria-label="처음 페이지"
          className="sb-tap grid size-10 place-items-center rounded-full border border-border bg-white text-muted-foreground transition-colors hover:bg-muted disabled:opacity-35"
          disabled={page <= 1 || isDisabled}
          type="button"
          onClick={() => goToPage(1)}
        >
          <ChevronsLeft className="size-5" />
        </button>
        <button
          aria-label="이전 페이지"
          className="sb-tap grid size-10 place-items-center rounded-full border border-border bg-white text-muted-foreground transition-colors hover:bg-muted disabled:opacity-35"
          disabled={page <= 1 || isDisabled}
          type="button"
          onClick={() => goToPage(page - 1)}
        >
          <ChevronLeft className="size-5" />
        </button>
        {getPaginationItems(page, safeTotalPages).map((item) => (
          <button
            key={item}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              "sb-tap size-10 rounded-full text-[16px] font-semibold transition-colors disabled:opacity-50",
              item === page
                ? "bg-primary text-white"
                : "text-foreground hover:bg-muted",
            )}
            disabled={isDisabled}
            type="button"
            onClick={() => goToPage(item)}
          >
            {item}
          </button>
        ))}
        <button
          aria-label="다음 페이지"
          className="sb-tap grid size-10 place-items-center rounded-full border border-border bg-white text-muted-foreground transition-colors hover:bg-muted disabled:opacity-35"
          disabled={page >= safeTotalPages || isDisabled}
          type="button"
          onClick={() => goToPage(page + 1)}
        >
          <ChevronRight className="size-5" />
        </button>
        <button
          aria-label="마지막 페이지"
          className="sb-tap grid size-10 place-items-center rounded-full border border-border bg-white text-muted-foreground transition-colors hover:bg-muted disabled:opacity-35"
          disabled={page >= safeTotalPages || isDisabled}
          type="button"
          onClick={() => goToPage(safeTotalPages)}
        >
          <ChevronsRight className="size-5" />
        </button>
      </div>
    </nav>
  );
}
