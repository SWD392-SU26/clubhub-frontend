import { apiRequest } from "./http";
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  UserProfile,
} from "../types/auth";

export const authApi = {
  login(payload: LoginRequest) {
    return apiRequest<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    });
  },

  register(payload: RegisterRequest) {
    return apiRequest<LoginResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    });
  },

  logout() {
    return apiRequest<unknown>("/api/auth/logout", {
      method: "POST",
    });
  },

  forgotPassword(payload: ForgotPasswordRequest) {
    return apiRequest<unknown>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    });
  },

  resetPassword(payload: ResetPasswordRequest) {
    return apiRequest<unknown>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    });
  },

  changePassword(payload: ChangePasswordRequest) {
    return apiRequest<unknown>("/api/auth/change-password", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  getMe() {
    return apiRequest<UserProfile>("/api/auth/me");
  },

  updateMe(payload: UpdateProfileRequest) {
    return apiRequest<UserProfile>("/api/auth/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};