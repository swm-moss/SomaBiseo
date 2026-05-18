"use client";

import { Star } from "lucide-react";

import { useEventFavoriteStore } from "@/features/favorite-event/model";
import { cn } from "@/shared/lib/utils";

export function FavoriteEventButton({ eventId }: { eventId: string }) {
  const favoriteEventIds = useEventFavoriteStore((state) => state.favoriteEventIds);
  const toggleFavorite = useEventFavoriteStore((state) => state.toggleFavorite);
  const isFavorite = favoriteEventIds.includes(eventId);

  return (
    <button
      aria-label={isFavorite ? "관심 일정 해제" : "관심 일정 저장"}
      className={cn(
        "sb-tap inline-flex size-11 items-center justify-center rounded-lg bg-white text-muted-foreground transition-colors hover:bg-slate-100",
        isFavorite && "bg-amber-50 text-amber-600",
      )}
      type="button"
      onClick={() => toggleFavorite(eventId)}
    >
      <Star aria-hidden="true" className={cn("size-5", isFavorite && "fill-current")} />
    </button>
  );
}
