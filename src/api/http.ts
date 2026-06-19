import { API_BASE_URL } from "./config";
import { getAccessToken } from "./authStorage";

type ApiResponse<T> = {
  success: boolean;
  message?: string | null;
  data?: T;
};

type RequestOptions = RequestInit & {
  auth?: boolean;
};

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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const json = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || json?.success === false) {
    throw new Error(json?.message ?? "Có lỗi xảy ra khi gọi API.");
  }

  return json?.data as T;
}
