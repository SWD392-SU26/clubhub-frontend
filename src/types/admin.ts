import type { ClubRole } from "./club";

export type ClubMember = {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  studentCode?: string | null;
  roleInClub: ClubRole | string;
  joinedAt: string;
};

export type MembershipRequest = {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  studentCode?: string | null;
  joinReason: string;
  status: string;
  requestedAt: string;
};

export type FeedbackItem = {
  id: string;
  userId: string;
  userFullName: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
};

export type FeedbackSummary = {
  averageRating: number;
  totalCount: number;
  items: FeedbackItem[];
};

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

export type AuditLogItem = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  performedByName?: string | null;
  description?: string | null;
  clubId?: string | null;
  createdAt: string;
};

export type AuditLogsResult = PagedResult<AuditLogItem>;

export type CreateClubWithAdminRequest = {
  name: string;
  category: AdminClubCategory;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  clubAdminUserId: string;
};
