import { apiRequest } from "./http";
import type { PagedResult } from "../types/common";
import type { MemberPoint, MyPointSummary } from "../types/point";

function toQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const pointApi = {
  getMyPoints(clubId: string) {
    return apiRequest<MyPointSummary>(`/api/clubs/${clubId}/points/me`);
  },

  getLeaderboard(clubId: string, page = 1, pageSize = 20) {
    return apiRequest<PagedResult<MemberPoint>>(
      `/api/clubs/${clubId}/points/leaderboard${toQuery({ page, pageSize })}`,
    );
  },
};
