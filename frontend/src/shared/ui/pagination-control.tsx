"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/shared/lib/utils";

type PaginationItem = number | "ellipsis";

type PaginationControlProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isDisabled?: boolean;
};

function getPaginationItems(page: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (page >= totalPages - 3) {
    return [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages];
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
      <div className="flex min-w-max items-center justify-center gap-1">
        <button
          aria-label="이전 페이지"
          className="sb-tap grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-35"
          disabled={page <= 1 || isDisabled}
          type="button"
          onClick={() => goToPage(page - 1)}
        >
          <ChevronLeft className="size-5" />
        </button>
        {getPaginationItems(page, safeTotalPages).map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="grid size-10 place-items-center text-[15px] font-medium text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "sb-tap size-10 rounded-lg text-[15px] font-semibold transition-colors disabled:opacity-50",
                item === page
                  ? "bg-foreground text-white"
                  : "bg-white text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              disabled={isDisabled}
              type="button"
              onClick={() => goToPage(item)}
            >
              {item}
            </button>
          ),
        )}
        <button
          aria-label="다음 페이지"
          className="sb-tap grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-35"
          disabled={page >= safeTotalPages || isDisabled}
          type="button"
          onClick={() => goToPage(page + 1)}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </nav>
  );
}
