const fixedNow = new Date("2026-05-18T09:00:00+09:00");

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "long",
  day: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function formatTime(value: string) {
  return timeFormatter.format(new Date(value));
}

export function formatTimeRange(startAt: string, endAt: string) {
  return `${formatTime(startAt)} - ${formatTime(endAt)}`;
}

export function getRelativePublishedAt(value: string) {
  const diff = fixedNow.getTime() - new Date(value).getTime();
  const hours = Math.max(1, Math.floor(diff / (1000 * 60 * 60)));

  if (hours < 24) {
    return `${hours}시간 전`;
  }

  return `${Math.floor(hours / 24)}일 전`;
}
