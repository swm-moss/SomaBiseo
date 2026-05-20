export const routes = {
  home: "/",
  login: "/login",
  inviteVerify: "/verify-invite",
  googleLoginCallback: "/login/google/callback",
  dashboard: "/dashboard",
  notices: "/notices",
  noticeDetail: (noticeId: string) => `/notices/${noticeId}`,
  events: "/events",
  eventDetail: (eventId: string) => `/events/${eventId}`,
  reviews: "/reviews",
  reviewsForEvent: (eventId: string) =>
    `/reviews?eventId=${encodeURIComponent(eventId)}`,
  settings: "/settings",
} as const;
