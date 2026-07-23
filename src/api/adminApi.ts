import { apiRequest } from "./http";
import type {
  AdminClubCategory,
  AdminClubStatus,
  AdminClubsResult,
  AdminUserRole,
  AdminUserStatus,
  AdminUsersResult,
  AdminUserProfile,
  AuditLogsResult,
  CreateClubWithAdminRequest,
} from "../types/admin";

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

export const adminApi = {
  getUsers(params: {
    role?: AdminUserRole | "";
    page?: number;
    pageSize?: number;
  } = {}) {
    return apiRequest<AdminUsersResult>(
      `/api/admin/users${toQuery({
        role: params.role,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
      })}`,
    );
  },

  getClubAdmins(params: {
    category?: AdminClubCategory | "";
    searchTerm?: string;
  } = {}) {
    return apiRequest<AdminUserProfile[]>(
      `/api/admin/club-admins${toQuery({
        category: params.category,
        searchTerm: params.searchTerm,
      })}`,
    );
  },

  updateUserStatus(userId: string, status: AdminUserStatus) {
    return apiRequest<boolean>(`/api/admin/users/${userId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  getClubs(params: {
    status?: AdminClubStatus | "";
    clubcategories?: AdminClubCategory | "";
    page?: number;
    pageSize?: number;
  } = {}) {
    return apiRequest<AdminClubsResult>(
      `/api/admin/clubs${toQuery({
        status: params.status,
        clubcategories: params.clubcategories,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
      })}`,
    );
  },

  createClub(payload: CreateClubWithAdminRequest) {
    return apiRequest<unknown>("/api/admin/clubs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateClubStatus(clubId: string, status: AdminClubStatus) {
    return apiRequest<boolean>(`/api/admin/clubs/${clubId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  getClubAuditLogs(clubId: string, params: {
    page?: number;
    pageSize?: number;
  } = {}) {
    return apiRequest<AuditLogsResult>(
      `/api/clubs/${clubId}/audit-logs${toQuery({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
      })}`,
    );
  },

  getEntityAuditLogs(entityType: string, entityId: string, params: {
    page?: number;
    pageSize?: number;
  } = {}) {
    return apiRequest<AuditLogsResult>(
      `/api/audit-logs/${encodeURIComponent(entityType)}/${entityId}${toQuery({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
      })}`,
    );
  },
};
