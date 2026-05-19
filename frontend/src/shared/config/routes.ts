export const routes = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  notices: "/notices",
  noticeDetail: (noticeId: string) => `/notices/${noticeId}`,
  events: "/events",
  eventDetail: (eventId: string) => `/events/${eventId}`,
  reviews: "/reviews",
  reviewDetail: (eventId: string) => `/reviews/${eventId}`,
  settings: "/settings",
} as const;
