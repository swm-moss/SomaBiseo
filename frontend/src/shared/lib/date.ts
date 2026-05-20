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

export function formatOptionalDateTime(value: string | null | undefined, fallback = "시간 미정") {
  return value ? formatDateTime(value) : fallback;
}

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function formatDateRange(start: Date, end: Date) {
  const inclusiveEnd = new Date(end.getTime() - 1);

  return `${dateFormatter.format(start)} - ${dateFormatter.format(inclusiveEnd)}`;
}

export function formatTime(value: string) {
  return timeFormatter.format(new Date(value));
}

export function formatTimeRange(startAt: string, endAt: string) {
  return `${formatTime(startAt)} - ${formatTime(endAt)}`;
}

export function formatOptionalTimeRange(
  startAt: string | null | undefined,
  endAt: string | null | undefined,
  fallback = "시간 미정",
) {
  if (!startAt) {
    return fallback;
  }

  if (!endAt) {
    return formatTime(startAt);
  }

  return formatTimeRange(startAt, endAt);
}

export function getRelativePublishedAt(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const hours = Math.max(1, Math.floor(diff / (1000 * 60 * 60)));

  if (hours < 24) {
    return `${hours}시간 전`;
  }

  return `${Math.floor(hours / 24)}일 전`;
}

export function getWeekRange(weekOffset = 0) {
  const start = new Date();
  const day = start.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  start.setDate(start.getDate() + mondayOffset + weekOffset * 7);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return { start, end };
}
