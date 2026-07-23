import type { LoginResponse, UserProfile } from "../types/auth";

const ACCESS_TOKEN_KEY = "clubhub_access_token";
const REFRESH_TOKEN_KEY = "clubhub_refresh_token";
const PROFILE_KEY = "clubhub_profile";

export function normalizeUserProfile(profile: UserProfile): UserProfile {
  const backendRole = profile.systemRole ?? profile.role;
  const systemRole =
    backendRole === "UniversityAdmin" ||
    backendRole === "ClubAdmin" ||
    backendRole === "ClubMember"
      ? backendRole
      : "Student";

  return {
    ...profile,
    role: backendRole ?? systemRole,
    systemRole,
  };
}

export function normalizeLoginResponse(data: LoginResponse): LoginResponse {
  return {
    ...data,
    profile: normalizeUserProfile(data.profile),
  };
}

export function setAuthSession(data: LoginResponse) {
  const normalized = normalizeLoginResponse(data);
  localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(normalized.profile));
  window.dispatchEvent(new Event("clubhub_profile_updated"));
}

export function setAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getProfile(): UserProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY);

  if (!raw) return null;

  try {
    return normalizeUserProfile(JSON.parse(raw) as UserProfile);
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
  window.dispatchEvent(new Event("clubhub_profile_updated"));

  // Xóa key mock cũ nếu còn.
  localStorage.removeItem("clubhub_user");
  localStorage.removeItem("clubhub_role");
}

export function setProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(normalizeUserProfile(profile)));
  window.dispatchEvent(new Event("clubhub_profile_updated"));
}
