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

export type UploadImageFolder =
  | "avatars"
  | "clubs"
  | "events"
  | "activities"
  | "proposals"
  | "uploads";

export type UploadImageResult = {
  url: string;
};

const MAX_UPLOAD_WAIT_MS = 60_000;
const SKIP_OPTIMIZATION_SIZE = 700 * 1024;

function getUploadErrorMessage(json: ApiResponse<unknown> | null) {
  return json?.message ?? "Upload ảnh thất bại.";
}

function optimizedFileName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "") || "image";
  return `${baseName}.webp`;
}

async function optimizeImage(file: File, folder: UploadImageFolder) {
  if (
    file.size <= SKIP_OPTIMIZATION_SIZE ||
    file.type === "image/gif" ||
    file.type === "image/svg+xml"
  ) {
    return file;
  }

  try {
    const image = await createImageBitmap(file);
    const maxDimension = folder === "avatars" ? 960 : 1920;
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      image.close();
      return file;
    }

    context.drawImage(image, 0, 0, width, height);
    image.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.82),
    );

    if (!blob || blob.size >= file.size) return file;

    return new File([blob], optimizedFileName(file.name), {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } catch {
    // Trình duyệt không giải mã được ảnh thì vẫn thử upload file gốc.
    return file;
  }
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
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    MAX_UPLOAD_WAIT_MS,
  );

  try {
    return await fetch(
      `${API_BASE_URL}/api/storage/upload-image?folder=${encodeURIComponent(folder)}`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
        signal: controller.signal,
      },
    );
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export const storageApi = {
  async uploadImage(file: File, folder: UploadImageFolder = "uploads") {
    const uploadFile = await optimizeImage(file, folder);

    if (uploadFile.size > 5 * 1024 * 1024) {
      throw new Error("Ảnh sau khi tối ưu vẫn vượt quá giới hạn 5 MB.");
    }

    try {
      const token = getAccessToken();
      let response = await uploadImageRequest(uploadFile, folder, token);

      if (response.status === 401) {
        const nextToken = await refreshUploadSession();
        response = await uploadImageRequest(uploadFile, folder, nextToken);
      }

      const json = (await response
        .json()
        .catch(() => null)) as ApiResponse<UploadImageResult> | null;

      if (!response.ok || json?.success === false || !json?.data) {
        throw new Error(getUploadErrorMessage(json));
      }

      return json.data;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error(
          "Upload ảnh quá thời gian chờ. Vui lòng kiểm tra mạng và thử lại.",
        );
      }
      throw error;
    }
  },
};
