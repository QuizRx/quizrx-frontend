import { UserRole, UserStatus } from "./enum";

export type User = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  inviteIssuedAt?: string | null;
  inviteExpiresAt?: string | null;
  inviteAcceptedAt?: string | null;
  updatedAt: string;
  createdAt: string;
};

export type UpdateUserInput = {
  id: string;
  role?: UserRole;
  status?: UserStatus;
  firstName?: string;
  lastName?: string;
};

export type InviteUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
};
