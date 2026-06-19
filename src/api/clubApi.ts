import { apiRequest } from "./http";
import type { PagedResult } from "../types/common";
import type {
  ClubDetail,
  ClubFilterRequest,
  ClubSummary,
  UpdateClubRequest,
} from "../types/club";

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

export const clubApi = {
  getClubs(filter: ClubFilterRequest = {}) {
    return apiRequest<PagedResult<ClubSummary>>(
      `/api/clubs${toQuery({
        category: filter.category,
        searchTerm: filter.searchTerm,
        page: filter.page ?? 1,
        pageSize: filter.pageSize ?? 12,
      })}`,
      { auth: false },
    );
  },

  getClubById(clubId: string) {
    return apiRequest<ClubDetail>(`/api/clubs/${clubId}`, { auth: false });
  },

  getMyClubs(page = 1, pageSize = 10) {
    return apiRequest<PagedResult<ClubSummary>>(
      `/api/clubs/my-clubs${toQuery({ page, pageSize })}`,
    );
  },

  updateClub(clubId: string, payload: UpdateClubRequest) {
    return apiRequest<ClubDetail>(`/api/clubs/${clubId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};
