import apiClient from "@/common/api/client";
import type { ApiResponse } from "@/types";

export interface NoticeItemPublic {
  id: number;
  title: string;
  content: string;
  // 값이 있으면 "쿠폰 지급형" 공지 — 상세 페이지에서 이 코드로 쿠폰을 받는다.
  couponCode: string | null;
  pinned: boolean;
  active: boolean;
  viewCount: number;
  createdAt: string;
}

// 공개 API — GET /api/notices (노출중인 공지만, 고정글 우선 최신순)
export const noticeApi = {
  getNotices: () => apiClient.get<ApiResponse<NoticeItemPublic[]>>("/notices"),
  getNoticeDetail: (id: number | string) =>
    apiClient.get<ApiResponse<NoticeItemPublic>>(`/notices/${id}`),
};
