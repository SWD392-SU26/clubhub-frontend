export type SystemRole =
  | "Student"
  | "ClubMember"
  | "ClubAdmin"
  | "UniversityAdmin";
export type BackendRole =
  | "Student"
  | "ClubMember"
  | "ClubAdmin"
  | "UniversityAdmin";

export type UserProfile = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  studentCode?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  role?: BackendRole | string;
  systemRole: SystemRole;
  status?: string;
  isEmailVerified?: boolean;
  createdAt: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  profile: UserProfile;
};

export type LoginRequest = {
  emailOrUsername: string;
  password: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type RegisterRequest = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  studentCode?: string;
  phone?: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type VerifyOtpRequest = {
  email: string;
  otp: string;
};

export type ResetPasswordRequest = {
  email: string;
  otp: string;
  newPassword: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type UpdateProfileRequest = {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
};

