import { UserRole } from '@prisma/client';

export type JwtPayload = {
  sub: string; // User ID
  email: string;
  role: UserRole;
};
