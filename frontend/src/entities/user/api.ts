import type { User } from "@/entities/user/model";

export const currentUserMock: User = {
  id: "user-1",
  email: "trainee@somabiseo.dev",
  name: "소마비서 사용자",
  provider: "GOOGLE",
};

export async function getCurrentUser() {
  return new Promise<User>((resolve) => {
    setTimeout(() => resolve(currentUserMock), 120);
  });
}
