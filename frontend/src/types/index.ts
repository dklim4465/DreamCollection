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
export type TravelPhase = "pre" | "on" | "post";

// 여행 스타일
export type TravelStyle =
  | "RELAXED"
  | "ACTIVE"
  | "CULTURE"
  | "FOOD"
  | "ADVENTURE";

// 유저
export interface User {
  id: number;
  email: string;
  name?: string;
  nickname: string;
  phone?: string;
  profileImage?: string;
  travelStyle: TravelStyle;
<<<<<<< HEAD
  role: "USER" | "ADMIN";
  createdAt: string;
}

// 도시 마스터 (자동완성 선택 결과 / 날씨·배경 이미지 연동용)
export interface City {
  id: number;
  nameKo: string;
  nameEn: string;
  countryName: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
}

// 추천 여행지 (히어로 캐러셀 / 이달의 여행지)
=======
  createdAt: string;
}

// 추천 여행지 (히어로 캐러셀)
>>>>>>> ab5408a9a3f42d0a447821c98a34f329a35ff4f6
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
<<<<<<< HEAD
  icon: string;
=======
  icon: string; // Material Symbol 이름
>>>>>>> ab5408a9a3f42d0a447821c98a34f329a35ff4f6
  title: string;
  description: string;
  href: string;
}

// 커뮤니티 피드 아이템
export type FeedItemType = "tip" | "guide" | "companion" | "spot";

export interface FeedItem {
  id: number;
  type: FeedItemType;
<<<<<<< HEAD
  badge?: string;
=======
  badge?: string; // "Tip", "Foodie Guide" 등
>>>>>>> ab5408a9a3f42d0a447821c98a34f329a35ff4f6
  title: string;
  excerpt?: string;
  imageUrl?: string;
  author?: Pick<User, "id" | "nickname" | "profileImage">;
  likeCount?: number;
  commentCount?: number;
<<<<<<< HEAD
  isLive?: boolean;
  createdAt: string;
}

// ── 여행 계획 (SCHEDULE) ──────────────────────────────────
export type ScheduleStatus = "DRAFT" | "PAID" | "CANCELLED";

=======
  isLive?: boolean; // 실시간 현황
  createdAt: string;
}

// 여행 계획
>>>>>>> ab5408a9a3f42d0a447821c98a34f329a35ff4f6
export interface TravelPlan {
  id: number;
  title: string;
  destination: string;
<<<<<<< HEAD
  city?: City;
  startDate: string;
  endDate: string;
  peopleCount: number;
  phase: TravelPhase;
  status: ScheduleStatus;
  shareLink?: string;
=======
  startDate: string;
  endDate: string;
  phase: TravelPhase;
>>>>>>> ab5408a9a3f42d0a447821c98a34f329a35ff4f6
  budget?: number;
  memo?: string;
  authorId: number;
  createdAt: string;
}

<<<<<<< HEAD
// ── 장바구니 (CART / CART_ITEM) ───────────────────────────
export interface CartItem {
  id: number;
  scheduleId: number;
  scheduleTitle: string;
  destination: string;
  price: number;
  addedAt: string;
}

// ── 결제 (PAYMENT) ────────────────────────────────────────
export type PaymentStatus = "PAID" | "CANCELLED" | "REFUNDED";
export type PaymentMethod = "CARD" | "EASY_PAY";

export interface Payment {
  id: number;
  scheduleId: number;
  scheduleTitle: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string;
}

// ── 여행일지 / 사진 (TRAVEL_LOG / LOG_PHOTO) ─────────────
export interface LogPhoto {
  id: number;
  imageUrl: string;
  takenAt?: string;
  latitude?: number;
  longitude?: number;
}

export interface TravelLog {
  id: number;
  title: string;
  scheduleId?: number;
  memo: string;
  photos: LogPhoto[];
  createdAt: string;
}

=======
>>>>>>> ab5408a9a3f42d0a447821c98a34f329a35ff4f6
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
  status: "OPEN" | "CLOSED";
  authorId: number;
  createdAt: string;
}
