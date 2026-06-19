export type ClubRole = "Member" | "VicePresident" | "President" | "ClubAdmin";

export type MembershipStatus = "Pending" | "Approved" | "Rejected" | "Left";

export type ClubCategory =
  | "Academic"
  | "Technology"
  | "Sports"
  | "Arts"
  | "Volunteer"
  | "SoftSkills"
  | "Media"
  | "Entrepreneurship";

export type ClubStatus = "Active" | "Hidden" | "Locked" | "Deleted";

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

export type ClubDetail = ClubSummary & {
  officers: ClubOfficer[];
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
