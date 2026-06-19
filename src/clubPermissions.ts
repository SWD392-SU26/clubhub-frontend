import type { MyMembership } from "./types/club";

export function isClubAdminMembership(membership: MyMembership) {
  return (
    membership.status === "Approved" &&
    (membership.roleInClub === "ClubAdmin" ||
      membership.roleInClub === "President")
  );
}

export function getPrimaryAdminMembership(memberships: MyMembership[]) {
  return memberships.find(isClubAdminMembership) ?? null;
}

export function hasClubAdminPermission(memberships: MyMembership[]) {
  return Boolean(getPrimaryAdminMembership(memberships));
}
