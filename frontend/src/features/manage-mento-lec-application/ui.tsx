"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

import {
  applyMentoLec,
  cancelMentoLecApplication,
} from "@/entities/soma-event/api";
import type { SomaEvent, SomaEventStatus } from "@/entities/soma-event/model";
import { Button } from "@/shared/ui/button";

type ManageMentoLecApplicationActionsProps = {
  event: SomaEvent;
  sessionId: string;
  onChanged?: () => void;
};

function getQustnrSn(event: SomaEvent) {
  try {
    const sourceUrl = new URL(event.sourceUrl);
    const fromUrl = sourceUrl.searchParams.get("qustnrSn");

    if (fromUrl) {
      return fromUrl;
    }
  } catch {
    // sourceId fallback below handles non-URL values.
  }

  if (event.sourceId.startsWith("qustnrSn-")) {
    return event.sourceId.slice("qustnrSn-".length);
  }

  if (/^\d+$/.test(event.sourceId)) {
    return event.sourceId;
  }

  return null;
}

function applyButtonLabel(status: SomaEventStatus) {
  switch (status) {
    case "OPEN":
      return "신청";
    case "FULL":
      return "정원 마감";
    case "CLOSED":
      return "신청 마감";
    case "CANCELED":
      return "취소됨";
    case "SCHEDULED":
      return "신청 예정";
    case "UNKNOWN":
      return "원본에서 확인";
  }
}

export function ManageMentoLecApplicationActions({
  event,
  sessionId,
  onChanged,
}: ManageMentoLecApplicationActionsProps) {
  const queryClient = useQueryClient();
  const qustnrSn = getQustnrSn(event);

  const refreshEvents = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["events", sessionId] }),
      queryClient.invalidateQueries({ queryKey: ["event", sessionId, event.id] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard-events", sessionId] }),
    ]);
    onChanged?.();
  };

  const applyMutation = useMutation({
    mutationFn: () => applyMentoLec(sessionId, qustnrSn!),
    onSuccess: async (response) => {
      toast.success(response.message || "신청 요청을 처리했어요.");
      await refreshEvents();
    },
    onError: () => {
      toast.error("신청 요청을 처리하지 못했습니다.");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelMentoLecApplication(sessionId, qustnrSn!),
    onSuccess: async (response) => {
      toast.success(response.message || "신청 취소 요청을 처리했어요.");
      await refreshEvents();
    },
    onError: () => {
      toast.error("신청 취소 요청을 처리하지 못했습니다.");
    },
  });

  const pending = applyMutation.isPending || cancelMutation.isPending;
  const canApply = event.status === "OPEN";

  if (!qustnrSn) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <Button
        className="h-11 w-full"
        disabled={pending || !canApply}
        onClick={() => {
          if (!window.confirm("이 멘토특강/자유멘토링을 신청할까요?")) {
            return;
          }

          applyMutation.mutate();
        }}
      >
        <CheckCircle2 aria-hidden="true" />
        {applyMutation.isPending ? "신청 중" : applyButtonLabel(event.status)}
      </Button>
      <Button
        className="h-11 w-full"
        disabled={pending}
        variant="outline"
        onClick={() => {
          if (!window.confirm("이 멘토특강/자유멘토링 신청을 취소할까요?")) {
            return;
          }

          cancelMutation.mutate();
        }}
      >
        <XCircle aria-hidden="true" />
        {cancelMutation.isPending ? "취소 중" : "신청 취소"}
      </Button>
    </div>
  );
}
