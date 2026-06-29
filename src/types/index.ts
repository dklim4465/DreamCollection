// ──────────────────────────────────────
// Traveler's Hub — 공통 타입 정의
// ──────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

// 사이드바 여행 단계
export type TravelPhase = 'pre' | 'on' | 'post';

// 여행 스타일
export type TravelStyle = 'RELAXED' | 'ACTIVE' | 'CULTURE' | 'FOOD' | 'ADVENTURE';

// 유저
export interface User {
  id: number;
  email: string;
  nickname: string;
  profileImage?: string;
  travelStyle: TravelStyle;
  createdAt: string;
}

// 추천 여행지 (히어로 캐러셀)
export interface DestinationCard {
  id: number;
  country: string;
  region: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

// 빠른 액션
export interface QuickAction {
  id: string;
  icon: string;           // Material Symbol 이름
  title: string;
  description: string;
  href: string;
}

// 커뮤니티 피드 아이템
export type FeedItemType = 'tip' | 'guide' | 'companion' | 'spot';

export interface FeedItem {
  id: number;
  type: FeedItemType;
  badge?: string;         // "Tip", "Foodie Guide" 등
  title: string;
  excerpt?: string;
  imageUrl?: string;
  author?: Pick<User, 'id' | 'nickname' | 'profileImage'>;
  likeCount?: number;
  commentCount?: number;
  isLive?: boolean;       // 실시간 현황
  createdAt: string;
}

// 여행 계획
export interface TravelPlan {
  id: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  phase: TravelPhase;
  budget?: number;
  memo?: string;
  authorId: number;
  createdAt: string;
}

// 동행 모집
export interface CompanionPost {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
  maxPeople: number;
  currentPeople: number;
  travelStyles: TravelStyle[];
  status: 'OPEN' | 'CLOSED';
  authorId: number;
  createdAt: string;
}
