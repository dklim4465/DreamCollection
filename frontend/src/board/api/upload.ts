import apiClient from "@/api/client";
import type { ApiResponse } from "@/types";

interface ImageUploadResponse {
  imageUrl: string;
}

export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post<ApiResponse<ImageUploadResponse>>(
      "/board/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },
};
