import { apiRequest } from "./http";
import type { PagedResult } from "../types/common";
import type { NotificationDto, UnreadCountDto } from "../types/notification";

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

export const notificationApi = {
  getNotifications(page = 1, pageSize = 20) {
    return apiRequest<PagedResult<NotificationDto>>(
      `/api/notifications${toQuery({ page, pageSize })}`,
    );
  },

  getUnreadCount() {
    return apiRequest<UnreadCountDto>("/api/notifications/unread-count");
  },

  markAsRead(notificationId: string) {
    return apiRequest<boolean>(`/api/notifications/${notificationId}/read`, {
      method: "PUT",
    });
  },

  markAllAsRead() {
    return apiRequest<boolean>("/api/notifications/read-all", {
      method: "PUT",
    });
  },
};
