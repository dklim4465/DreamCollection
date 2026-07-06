import apiClient from "@/common/api/client";
import type { ApiResponse, PageResponse } from "@/types";
import type { Banner } from "@/home/api/bannerApi";
import type { MonthlyDestinationItem } from "@/home/api/monthlyDestinationApi";

export interface MainBackgroundItem {
  id: number;
  mediaType: "IMAGE" | "VIDEO";
  mediaUrl: string;
  active: boolean;
}

export interface NoticeItem {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  active: boolean;
  viewCount: number;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  nickname: string;
  phone: string | null;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "WITHDRAWN";
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
}

export interface BannerAdminForm {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  displayOrder?: number;
  active?: boolean;
}

export interface MainBackgroundAdminForm {
  mediaType: "IMAGE" | "VIDEO";
  mediaUrl: string;
  active?: boolean;
}

export interface NoticeAdminForm {
  title: string;
  content: string;
  pinned?: boolean;
  active?: boolean;
}

export interface MonthlyDestinationAdminForm {
  displayMonth: string;
  destinationName: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  displayOrder?: number;
  active?: boolean;
}

export const adminApi = {
  // ── 배너 ──────────────────────────────────────────
  getBanners: () => apiClient.get<ApiResponse<Banner[]>>("/admin/banners"),
  createBanner: (data: BannerAdminForm) =>
    apiClient.post<ApiResponse<Banner>>("/admin/banners", data),
  updateBanner: (id: number, data: BannerAdminForm) =>
    apiClient.put<ApiResponse<Banner>>(`/admin/banners/${id}`, data),
  deleteBanner: (id: number) => apiClient.delete<ApiResponse<void>>(`/admin/banners/${id}`),

  // ── 메인 배경 ──────────────────────────────────────
  getMainBackgrounds: () =>
    apiClient.get<ApiResponse<MainBackgroundItem[]>>("/admin/main-backgrounds"),
  createMainBackground: (data: MainBackgroundAdminForm) =>
    apiClient.post<ApiResponse<MainBackgroundItem>>("/admin/main-backgrounds", data),
  updateMainBackground: (id: number, data: MainBackgroundAdminForm) =>
    apiClient.put<ApiResponse<MainBackgroundItem>>(`/admin/main-backgrounds/${id}`, data),
  deleteMainBackground: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/admin/main-backgrounds/${id}`),

  // ── 공지사항 ──────────────────────────────────────
  getNotices: () => apiClient.get<ApiResponse<NoticeItem[]>>("/admin/notices"),
  createNotice: (data: NoticeAdminForm) =>
    apiClient.post<ApiResponse<NoticeItem>>("/admin/notices", data),
  updateNotice: (id: number, data: NoticeAdminForm) =>
    apiClient.put<ApiResponse<NoticeItem>>(`/admin/notices/${id}`, data),
  deleteNotice: (id: number) => apiClient.delete<ApiResponse<void>>(`/admin/notices/${id}`),

  // ── 이달의 여행지 ──────────────────────────────────
  getMonthlyDestinations: () =>
    apiClient.get<ApiResponse<MonthlyDestinationItem[]>>("/admin/monthly-destinations"),
  createMonthlyDestination: (data: MonthlyDestinationAdminForm) =>
    apiClient.post<ApiResponse<MonthlyDestinationItem>>("/admin/monthly-destinations", data),
  updateMonthlyDestination: (id: number, data: MonthlyDestinationAdminForm) =>
    apiClient.put<ApiResponse<MonthlyDestinationItem>>(`/admin/monthly-destinations/${id}`, data),
  deleteMonthlyDestination: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/admin/monthly-destinations/${id}`),

  // ── 회원 관리 ──────────────────────────────────────
  getUsers: (keyword: string, page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<AdminUser>>>("/admin/users", {
      params: { keyword: keyword || undefined, page, size },
    }),
  changeUserStatus: (id: number, status: AdminUser["status"]) =>
    apiClient.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/status`, { status }),
};
