import apiClient from "@/api/client";
import type { ApiResponse } from "@/types";

export interface NotificationItem {
  id: number;
  type: string;
  targetType: string | null;
  targetId: number | null;
  content: string;
  read: boolean;
  createdAt: string;
}

interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export const notificationApi = {
  getUnreadCount: () =>
    apiClient.get<ApiResponse<number>>("/notifications/unread-count"),

  // 메이트/채팅 등 기존 알림 + 게시판 알림을 각각 받아서 합친다
  getList: async (page = 0, size = 10) => {
    const [generalRes, boardRes] = await Promise.all([
      apiClient.get<ApiResponse<SpringPage<NotificationItem>>>(
        "/notifications",
        { params: { page, size } },
      ),
      apiClient.get<ApiResponse<SpringPage<NotificationItem>>>(
        "/board/notifications",
        { params: { page, size } },
      ),
    ]);

    const merged = [
      ...generalRes.data.data.content,
      ...boardRes.data.data.content,
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return {
      data: {
        data: {
          content: merged,
          totalElements: merged.length,
          totalPages: 1,
          number: 0,
        },
      },
    };
  },

  markRead: (notificationId: number) =>
    apiClient.post<ApiResponse<void>>(`/notifications/${notificationId}/read`),
};
