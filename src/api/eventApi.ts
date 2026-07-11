import { apiRequest } from "./http";
import { clubApi } from "./clubApi";
import type { PagedResult } from "../types/common";
import type { CreateEventRequest, EventDto, EventRegistration, UpdateEventRequest } from "../types/event";

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

  async getPublicUpcomingEvents(limit = 20) {
    const clubResult = await clubApi.getClubs({ page: 1, pageSize: 50 });
    const eventResults = await Promise.all(
      clubResult.items.map((club) =>
        eventApi.getClubEvents(club.id, 1, 50).catch(() => null),
      ),
    );
    const now = Date.now();
    const eventsById = new Map<string, EventDto>();

    eventResults.forEach((result) => {
      result?.items.forEach((event) => {
        const startTime = new Date(event.startTime).getTime();

        if (
          event.status === "Published" &&
          !Number.isNaN(startTime) &&
          startTime >= now
        ) {
          eventsById.set(event.id, event);
        }
      });
    });

    return Array.from(eventsById.values())
      .sort(
        (first, second) =>
          new Date(first.startTime).getTime() -
          new Date(second.startTime).getTime(),
      )
      .slice(0, limit);
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

  create(clubId: string, payload: CreateEventRequest) {
    return apiRequest<EventDto>(`/api/clubs/${clubId}/events`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(eventId: string, payload: UpdateEventRequest) {
    return apiRequest<EventDto>(`/api/events/${eventId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  cancel(eventId: string) {
    return apiRequest<boolean>(`/api/events/${eventId}`, { method: "DELETE" });
  },

  getRegistrations(eventId: string, page = 1, pageSize = 100) {
    return apiRequest<PagedResult<EventRegistration>>(
      `/api/events/${eventId}/registrations${toQuery({ page, pageSize })}`,
    );
  },

  checkIn(eventId: string, userId: string) {
    return apiRequest<boolean>(`/api/events/${eventId}/checkin/${userId}`, { method: "POST" });
  },
};
