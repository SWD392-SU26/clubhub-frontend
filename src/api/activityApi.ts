import { apiRequest } from "./http";
import type { PagedResult } from "../types/common";
import type {
  ActivityDetailDto,
  ActivityDto,
  CreateActivityRequest,
  MyRegisteredActivityDto,
  RegisterActivityRequest,
  UpdateActivityRequest,
} from "../types/activity";

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

export const activityApi = {
  getClubActivities(clubId: string, page = 1, pageSize = 20) {
    return apiRequest<PagedResult<ActivityDto>>(
      `/api/clubs/${clubId}/activities${toQuery({ page, pageSize })}`,
      { auth: false },
    );
  },

  getActivityById(activityId: string) {
    return apiRequest<ActivityDetailDto>(`/api/activities/${activityId}`);
  },

  create(clubId: string, payload: CreateActivityRequest) {
    return apiRequest<ActivityDto>(`/api/clubs/${clubId}/activities`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(activityId: string, payload: UpdateActivityRequest) {
    return apiRequest<ActivityDto>(`/api/activities/${activityId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  cancel(activityId: string) {
    return apiRequest<boolean>(`/api/activities/${activityId}`, {
      method: "DELETE",
    });
  },

  checkIn(activityId: string, userId: string) {
    return apiRequest<boolean>(`/api/activities/${activityId}/checkin/${userId}`, {
      method: "POST",
    });
  },

  register(activityId: string, payload: RegisterActivityRequest = {}) {
    return apiRequest<boolean>(`/api/activities/${activityId}/register`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  cancelRegistration(activityId: string) {
    return apiRequest<boolean>(`/api/activities/${activityId}/register`, {
      method: "DELETE",
    });
  },

  getMyActivities(page = 1, pageSize = 20) {
    return apiRequest<PagedResult<MyRegisteredActivityDto>>(
      `/api/my-activities${toQuery({ page, pageSize })}`,
    );
  },
};
