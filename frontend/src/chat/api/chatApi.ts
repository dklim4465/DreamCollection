import apiClient from "@/api/client";
import type { ApiResponse } from "@/types";
import type { ChatRoom, ChatMessage } from "@/chat/types/chat";

export const chatApi = {
  getMyRooms: () => apiClient.get<ApiResponse<ChatRoom[]>>("/chat/rooms"),
  getMessages: (roomId: number) =>
    apiClient.get<ApiResponse<ChatMessage[]>>(`/chat/rooms/${roomId}/messages`),
  openRoom: (matePostId: number) =>
    apiClient.post<ApiResponse<number>>(`/chat/mate-posts/${matePostId}/room`),
  openDmRoom: (friendUserId: number) =>
    apiClient.post<ApiResponse<number>>(`/chat/dm/${friendUserId}/room`),
  markRead: (roomId: number) =>
    apiClient.post<ApiResponse<void>>(`/chat/rooms/${roomId}/read`),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<ApiResponse<{ imageUrl: string }>>(
      "/chat/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },
};
