export type UserPreferences = {
  noticeBookmarkIds: string[];
  eventFavoriteIds: string[];
  interestTopicIds: string[];
};

export const emptyUserPreferences: UserPreferences = {
  noticeBookmarkIds: [],
  eventFavoriteIds: [],
  interestTopicIds: [],
};
