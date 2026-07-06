import apiClient from "@/common/api/client";
import type { ApiResponse } from "@/types";

export interface HeroMedia {
  url: string;
  type: "IMAGE" | "VIDEO";
  // MONTHLY 모드에서 슬라이드마다 다른 문구를 보여주기 위한 필드 (없으면 상단 title/subtitle 사용)
  title?: string | null;
  subtitle?: string | null;
}

export interface MainHeroData {
  mode: "SCHEDULE" | "MONTHLY" | "DEFAULT";
  imageUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  title: string;
  subtitle: string | null;
  tripRequestId: number | null;
  medias: HeroMedia[];
}

// 백엔드가 로그인 여부/다가오는 일정 유무를 판단해서 우선순위대로 하나만 내려줌
// (로그인 + 다가오는 일정 > 이달의 여행지 > 관리자 기본 배경)
// 비로그인 상태에서도 호출 가능한 공개 API
export const mainHeroApi = {
  getBackground: () => apiClient.get<ApiResponse<MainHeroData>>("/main/background"),
};