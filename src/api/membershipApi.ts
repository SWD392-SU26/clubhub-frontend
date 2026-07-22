import { apiRequest } from "./http";
import type { ClubRole, MyMembership } from "../types/club";
import type { ClubMember, MembershipRequest } from "../types/admin";
import type { PagedResult } from "../types/common";

export const membershipApi = {
  getMyMemberships() {
    return apiRequest<MyMembership[]>("/api/my-memberships");
  },

  joinClub(clubId: string, joinReason?: string) {
    return apiRequest<boolean>(`/api/clubs/${clubId}/members/join`, {
      method: "POST",
      body: JSON.stringify({ joinReason }),
    });
  },

  leaveClub(clubId: string) {
    return apiRequest<boolean>(`/api/clubs/${clubId}/members/leave`, {
      method: "DELETE",
    });
  },

  cancelJoinRequest(clubId: string) {
    return apiRequest<boolean>(`/api/clubs/${clubId}/members/cancel-request`, {
      method: "DELETE",
    });
  },

  getMembers(clubId: string, page = 1, pageSize = 100) {
    return apiRequest<PagedResult<ClubMember>>(
      `/api/clubs/${clubId}/members?page=${page}&pageSize=${pageSize}`,
    );
  },

  getPendingRequests(clubId: string, page = 1, pageSize = 100) {
    return apiRequest<PagedResult<MembershipRequest>>(
      `/api/clubs/${clubId}/members/pending?page=${page}&pageSize=${pageSize}`,
    );
  },

  reviewRequest(clubId: string, membershipId: string, isApproved: boolean, rejectionReason?: string) {
    return apiRequest<boolean>(`/api/clubs/${clubId}/members/requests/${membershipId}/review`, {
      method: "PUT",
      body: JSON.stringify({ isApproved, rejectionReason }),
    });
  },

  assignRole(clubId: string, userId: string, newRole: ClubRole) {
    return apiRequest<boolean>(`/api/clubs/${clubId}/members/assign-role`, {
      method: "PUT",
      body: JSON.stringify({ userId, newRole }),
    });
  },

  removeMember(clubId: string, userId: string) {
    return apiRequest<boolean>(`/api/clubs/${clubId}/members/${userId}`, { method: "DELETE" });
  },
};
