"use client";

import { Star } from "lucide-react";
import { toast } from "sonner";

import { useEventFavorites, useFavoriteEventMutation } from "@/features/favorite-event/model";
import { cn } from "@/shared/lib/utils";

export function FavoriteEventButton({ eventId }: { eventId: string }) {
  const { favoriteEventIds, isLoading } = useEventFavorites();
  const favoriteMutation = useFavoriteEventMutation();
  const isFavorite = favoriteEventIds.includes(eventId);

  return (
    <button
      aria-label={isFavorite ? "관심 일정 해제" : "관심 일정 저장"}
      className={cn(
        "sb-tap inline-flex size-11 items-center justify-center rounded-lg bg-white text-muted-foreground transition-colors hover:bg-slate-100",
        isFavorite && "bg-amber-50 text-amber-600",
      )}
      disabled={isLoading || favoriteMutation.isPending}
      type="button"
      onClick={() =>
        favoriteMutation.mutate(
          { eventId, favorite: isFavorite },
          {
            onError: () => toast.error("관심 일정을 저장하지 못했어요."),
          },
        )
      }
    >
      <Star aria-hidden="true" className={cn("size-5", isFavorite && "fill-current")} />
    </button>
  );
}
