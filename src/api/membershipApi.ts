import { apiRequest } from "./http";
import type { MyMembership } from "../types/club";

export const membershipApi = {
  getMyMemberships() {
    return apiRequest<MyMembership[]>("/api/my-memberships");
  },
};
