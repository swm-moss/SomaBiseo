export type User = {
  id: string;
  email: string;
  name: string;
  profileImageUrl?: string;
  provider: "EMAIL" | "GOOGLE";
};
