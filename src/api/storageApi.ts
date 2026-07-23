import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  setAuthSession,
} from "./authStorage";
import { API_BASE_URL } from "./config";
import type { LoginResponse } from "../types/auth";

type ApiResponse<T> = {
  success: boolean;
  message?: string | null;
  data?: T;
};

export type UploadImageFolder = "avatars" | "clubs" | "events" | "proposals" | "uploads";

export type UploadImageResult = {
  url: string;
};

function getUploadErrorMessage(json: ApiResponse<unknown> | null) {
  return json?.message ?? "Upload ảnh thất bại.";
}

async function refreshUploadSession() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }

  const response = await fetch(`${API_BASE_URL}/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  const json = (await response
    .json()
    .catch(() => null)) as ApiResponse<LoginResponse> | null;

  if (!response.ok || json?.success === false || !json?.data) {
    clearAuthSession();
    throw new Error(json?.message ?? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }

  setAuthSession(json.data);
  return json.data.accessToken;
}

async function uploadImageRequest(file: File, folder: UploadImageFolder, token: string | null) {
  const formData = new FormData();

  formData.set("file", file);

  return fetch(
    `${API_BASE_URL}/api/storage/upload-image?folder=${encodeURIComponent(folder)}`,
    {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    },
  );
}

export const storageApi = {
  async uploadImage(file: File, folder: UploadImageFolder = "uploads") {
    const token = getAccessToken();
    let response = await uploadImageRequest(file, folder, token);

    if (response.status === 401) {
      const nextToken = await refreshUploadSession();
      response = await uploadImageRequest(file, folder, nextToken);
    }

    const json = (await response
      .json()
      .catch(() => null)) as ApiResponse<UploadImageResult> | null;

    if (!response.ok || json?.success === false || !json?.data) {
      throw new Error(getUploadErrorMessage(json));
    }

    return json.data;
  },
};

import { apiRequest } from "./http";

type UploadResult = {
  url: string;
};

export const storageApi = {
  uploadImage(file: File, folder = "uploads") {
    const formData = new FormData();
    formData.set("file", file);

    return apiRequest<UploadResult>(
      `/api/storage/upload-image?folder=${encodeURIComponent(folder)}`,
      {
        method: "POST",
        body: formData,
      },
    );
  },
};
