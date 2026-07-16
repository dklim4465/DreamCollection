export const MATE_POST_STATUSES = ["ALL", "RECRUITING", "CLOSED"] as const;
export type MatePostStatus = (typeof MATE_POST_STATUSES)[number];

export const MATE_POST_STATUS_LABELS: Record<MatePostStatus, string> = {
  ALL: "전체",
  RECRUITING: "모집중",
  CLOSED: "모집완료",
};

export const MATE_REQUEST_STATUSES = [
  "REQUESTED",
  "ACCEPTED",
  "REJECTED",
] as const;
export type MateRequestStatus = (typeof MATE_REQUEST_STATUSES)[number];

export const MATE_REQUEST_STATUS_LABELS: Record<MateRequestStatus, string> = {
  REQUESTED: "대기중",
  ACCEPTED: "수락됨",
  REJECTED: "거절됨",
};

export const PREFERRED_GENDERS = ["무관", "동성", "이성"] as const;
export const TRAVEL_STYLES = [
  "무관",
  "힐링",
  "액티비티",
  "맛집",
  "문화/역사",
  "쇼핑",
] as const;

export interface MatePostListItem {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  preferredAge: string | null;
  preferredGender: string | null;
  travelStyle: string | null;
  recruitCount: number;
  status: string;
  createdAt: string;
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  level: number;
  badgeName: string | null;
  badgeIconUrl: string | null;
}

export interface MatePostDetail {
  id: number;
  userId: number;
  cityId: number | null;
  destination: string;
  startDate: string;
  endDate: string;
  content: string;
  preferredAge: string | null;
  preferredGender: string | null;
  travelStyle: string | null;
  recruitCount: number;
  status: string;
  createdAt: string;
  nickname: string;
  profileImageUrl: string | null;
}

export interface MatePostCreateRequest {
  cityId?: number | null;
  destination: string;
  startDate: string;
  endDate: string;
  content: string;
  preferredAge?: string | null;
  preferredGender?: string | null;
  travelStyle?: string | null;
  recruitCount?: number | null;
}

export interface MatePostUpdateRequest {
  destination: string;
  startDate?: string | null;
  endDate?: string | null;
  content: string;
  preferredAge?: string | null;
  preferredGender?: string | null;
  travelStyle?: string | null;
  recruitCount?: number | null;
  status?: string | null;
}

export interface MateRequest {
  id: number;
  matePostId: number;
  requesterId: number;
  status: string;
  message: string | null;
  createdAt: string;
  nickname: string;
  profileImageUrl: string | null;
}

export interface MateRequestCreateRequest {
  message?: string | null;
}

export interface MateRequestDecisionRequest {
  decision: "ACCEPT" | "REJECT";
}

export interface MateReviewCreateRequest {
  matePostId: number;
  revieweeId: number;
  rating: number;
  content?: string | null;
}

export interface MateReview {
  id: number;
  matePostId: number;
  reviewerId: number;
  revieweeId: number;
  rating: number;
  content: string | null;
  createdAt: string;
}

export interface MateScheduleLinkCreateRequest {
  requestId: number;
}

export interface MateScheduleLink {
  id: number;
  matePostId: number;
  requestId: number;
  linkedAt: string;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface MatePostListItem {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  preferredAge: string | null;
  preferredGender: string | null;
  travelStyle: string | null;
  recruitCount: number;
  status: string;
  createdAt: string;
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  level: number;
  badgeName: string | null;
  badgeIconUrl: string | null;
  badgeConditionType: string | null;
}
