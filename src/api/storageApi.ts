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
