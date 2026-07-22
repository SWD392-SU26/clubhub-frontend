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
