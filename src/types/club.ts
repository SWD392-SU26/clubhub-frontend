export type ClubRole = "ClubMember" | "ClubAdmin";

export type MembershipStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancelled"
  | "Left";

export type ClubCategory =
  | "Academic"
  | "Technology"
  | "Sports"
  | "Arts"
  | "Volunteer"
  | "SoftSkills"
  | "Media"
  | "Entrepreneurship";

export type ClubStatus = "Active" | "Inactive" | "Lock" | "Deleted";

export type ClubSummary = {
  id: string;
  name: string;
  category: ClubCategory | string;
  description?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  status: ClubStatus | string;
  memberCount: number;
  createdAt: string;
};

export type ClubOfficer = {
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  roleInClub: ClubRole | string;
};

export type ClubMemberDetail = {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  studentCode?: string | null;
  roleInClub: ClubRole | string;
  joinedAt?: string | null;
};

export type ClubDetail = ClubSummary & {
  officers: ClubOfficer[];
  members: ClubMemberDetail[];
};

export type ClubFilterRequest = {
  category?: ClubCategory;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
};

export type UpdateClubRequest = {
  name?: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
};

export type MyMembership = {
  clubId: string;
  clubName: string;
  clubLogo?: string | null;
  roleInClub: ClubRole;
  status: MembershipStatus;
  requestedAt: string;
  joinedAt?: string | null;
};
