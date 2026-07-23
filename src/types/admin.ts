import type { PagedResult } from "./common";

export type AdminUserRole =
  | "Student"
  | "ClubMember"
  | "ClubAdmin"
  | "UniversityAdmin";

export type AdminUserStatus = "Active" | "Inactive" | "Lock" | "Deleted";

export type AdminUserProfile = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  studentCode?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  role: AdminUserRole | string;
  status: AdminUserStatus | string;
  isEmailVerified: boolean;
  createdAt: string;
};

export type AdminUsersResult = PagedResult<AdminUserProfile>;

export type UpdateUserStatusRequest = {
  status: AdminUserStatus;
};

export type AdminClubStatus = "Active" | "Inactive" | "Lock" | "Deleted";

export type AdminClubCategory =
  | "Academic"
  | "Technology"
  | "Sports"
  | "Arts"
  | "Volunteer"
  | "SoftSkills"
  | "Media"
  | "Entrepreneurship";

export type AdminClubSummary = {
  id: string;
  name: string;
  category: AdminClubCategory | string;
  description?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  status: AdminClubStatus | string;
  memberCount?: number;
  createdAt: string;
};

export type AdminClubsResult = PagedResult<AdminClubSummary>;

export type CreateClubWithAdminRequest = {
  name: string;
  category: AdminClubCategory;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  clubAdminUserId: string;
};
