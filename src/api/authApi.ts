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
  RefreshTokenRequest
} from "../types/auth";

export const authApi = {
  login(payload: LoginRequest) {
    return apiRequest<LoginResponse>("/login", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    });
  },

  register(payload: RegisterRequest) {
    return apiRequest<LoginResponse>("/register", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    });
  },

  refreshToken(payload: RefreshTokenRequest) {
    return apiRequest<LoginResponse>("/refresh-token", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    });
  },

  logout() {
    return Promise.resolve(true);
  },

  forgotPassword(payload: ForgotPasswordRequest) {
    return apiRequest<unknown>("/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    });
  },

  resetPassword(payload: ResetPasswordRequest) {
    return apiRequest<unknown>("/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    });
  },

  changePassword(payload: ChangePasswordRequest) {
    return apiRequest<unknown>("/change-password", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  getMe() {
    return apiRequest<UserProfile>("/me");
  },

  updateMe(payload: UpdateProfileRequest) {
    return apiRequest<UserProfile>("/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};
