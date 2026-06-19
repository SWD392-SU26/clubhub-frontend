export type ClubRole = "Member" | "VicePresident" | "President" | "ClubAdmin";

export type MembershipStatus = "Pending" | "Approved" | "Rejected" | "Left";

export type MyMembership = {
  clubId: string;
  clubName: string;
  clubLogo?: string | null;
  roleInClub: ClubRole;
  status: MembershipStatus;
  requestedAt: string;
  joinedAt?: string | null;
};
