import type { User } from "@/entities/user/model";

export const currentUserMock: User = {
  id: "user-1",
  email: "trainee@somabiseo.dev",
  name: "주인님",
  provider: "GOOGLE",
};

export async function getCurrentUser() {
  return new Promise<User>((resolve) => {
    setTimeout(() => resolve(currentUserMock), 120);
  });
}
