import type { MyMembership } from "./types/club";

const SELECTED_ADMIN_CLUB_KEY = "clubhub_selected_admin_club_id";

export function isClubAdminMembership(membership: MyMembership) {
  return (
    membership.status === "Approved" &&
    membership.roleInClub === "ClubAdmin"
  );
}

export function getSelectedAdminClubId() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(SELECTED_ADMIN_CLUB_KEY) ?? "";
}

export function setSelectedAdminClubId(clubId: string) {
  if (typeof window === "undefined") return;
  if (clubId) {
    window.localStorage.setItem(SELECTED_ADMIN_CLUB_KEY, clubId);
  } else {
    window.localStorage.removeItem(SELECTED_ADMIN_CLUB_KEY);
  }
}

export function getAdminMemberships(memberships: MyMembership[]) {
  return memberships.filter(isClubAdminMembership);
}

export function getPrimaryAdminMembership(memberships: MyMembership[]) {
  const adminMemberships = getAdminMemberships(memberships);
  const selectedClubId = getSelectedAdminClubId();

  return (
    adminMemberships.find(
      (membership) => membership.clubId === selectedClubId,
    ) ??
    adminMemberships[0] ??
    null
  );
}

export function hasClubAdminPermission(memberships: MyMembership[]) {
  return Boolean(getPrimaryAdminMembership(memberships));
}
