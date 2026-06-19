import type { LoginResponse, UserProfile } from "../types/auth";

const ACCESS_TOKEN_KEY = "clubhub_access_token";
const REFRESH_TOKEN_KEY = "clubhub_refresh_token";
const PROFILE_KEY = "clubhub_profile";

export function setAuthSession(data: LoginResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(data.profile));
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getProfile(): UserProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);

  // Xóa key mock cũ nếu còn.
  localStorage.removeItem("clubhub_user");
  localStorage.removeItem("clubhub_role");
}