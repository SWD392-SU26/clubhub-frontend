import { apiRequest } from "./http";
import type { MyMembership } from "../types/club";

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
};
