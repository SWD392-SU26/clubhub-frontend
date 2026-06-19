import { apiRequest } from "./http";
import type { PagedResult } from "../types/common";
import type { EventDto, EventRegistration } from "../types/event";

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

export const eventApi = {
  getClubEvents(clubId: string, page = 1, pageSize = 10) {
    return apiRequest<PagedResult<EventDto>>(
      `/api/clubs/${clubId}/events${toQuery({ page, pageSize })}`,
      { auth: false },
    );
  },

  getEventById(eventId: string) {
    return apiRequest<EventDto>(`/api/events/${eventId}`, { auth: false });
  },

  getMyEvents() {
    return apiRequest<EventRegistration[]>("/api/my-events");
  },

  register(eventId: string) {
    return apiRequest<boolean>(`/api/events/${eventId}/register`, {
      method: "POST",
    });
  },

  cancelRegistration(eventId: string) {
    return apiRequest<boolean>(`/api/events/${eventId}/register`, {
      method: "DELETE",
    });
  },
};
