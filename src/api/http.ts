import { API_BASE_URL } from "./config";
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  setAuthSession,
} from "./authStorage";
import type { LoginResponse } from "../types/auth";

type ApiResponse<T> = {
  success: boolean;
  message?: string | null;
  data?: T;
};

type RequestOptions = RequestInit & {
  auth?: boolean;
  retry?: boolean;
};

let refreshPromise: Promise<LoginResponse> | null = null;

async function refreshSession() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        const json = (await response
          .json()
          .catch(() => null)) as ApiResponse<LoginResponse> | null;

        if (!response.ok || json?.success === false || !json?.data) {
          throw new Error(
            json?.message ??
              "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
          );
        }

        setAuthSession(json.data);
        return json.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (options.auth !== false && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = { ...options };
  delete (fetchOptions as RequestOptions).auth;
  delete (fetchOptions as RequestOptions).retry;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (
    response.status === 401 &&
    options.auth !== false &&
    options.retry !== false
  ) {
    try {
      await refreshSession();
      return apiRequest<T>(path, {
        ...options,
        retry: false,
      });
    } catch (err) {
      clearAuthSession();
      throw new Error(
        err instanceof Error
          ? err.message
          : "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      );
    }
  }

  const json = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || json?.success === false) {
    throw new Error(json?.message ?? "Có lỗi xảy ra khi gọi API.");
  }

  return json?.data as T;
}
