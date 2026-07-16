// src/board/types/board.ts
export const BOARD_CATEGORIES = ["ALL", "FREE", "TRANSFER", "REVIEW"] as const;
export type BoardCategory = (typeof BOARD_CATEGORIES)[number];

export const BOARD_WRITE_CATEGORIES = BOARD_CATEGORIES.filter(
  (c) => c !== "ALL",
) as Exclude<BoardCategory, "ALL">[];

export const BOARD_CATEGORY_LABELS: Record<BoardCategory, string> = {
  ALL: "전체",
  FREE: "자유",
  TRANSFER: "예약양도",
  REVIEW: "후기",
};

export const TRADE_STATUSES = ["ON_SALE", "SOLD_OUT"] as const;
export type TradeStatus = (typeof TRADE_STATUSES)[number];

export const TRADE_STATUS_LABELS: Record<string, string> = {
  ON_SALE: "판매중",
  SOLD_OUT: "거래완료",
};

export interface BoardPostListItem {
  id: number;
  category: string;
  title: string;
  price: number | null;
  viewCount: number;
  likeCount: number;
  tradeStatus: string | null;
  createdAt: string;
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  commentCount: number;
  level: number;
  badgeName: string | null;
  badgeIconUrl: string | null;
  badgeConditionType: string | null;
}

export interface BoardPostDetail {
  id: number;
  userId: number;
  category: string;
  title: string;
  content: string;
  price: number | null;
  viewCount: number;
  likeCount: number;
  tradeStatus: string | null;
  createdAt: string;
  nickname: string;
  profileImageUrl: string | null;
  liked: boolean;
}

export interface BoardPostCreateRequest {
  category: string;
  title: string;
  content: string;
  price?: number | null;
}

export interface BoardPostUpdateRequest {
  title: string;
  content: string;
  price?: number | null;
  tradeStatus?: string | null;
}

export interface BoardComment {
  id: number;
  postId: number;
  userId: number;
  parentCommentId: number | null;
  content: string;
  createdAt: string;
  nickname: string;
  profileImageUrl: string | null;
}

export interface BoardCommentCreateRequest {
  content: string;
  parentCommentId?: number | null;
}

export interface BoardCommentUpdateRequest {
  content: string;
}

export interface BoardLikeResult {
  liked: boolean;
  likeCount: number;
}

export interface BoardImage {
  id: number;
  postId: number;
  imageUrl: string;
  orderNo: number | null;
}

export interface BoardImageCreateRequest {
  imageUrl: string;
  orderNo?: number | null;
}

export type ReportTargetType = "POST" | "COMMENT" | "USER";

export interface ReportCreateRequest {
  targetType: ReportTargetType;
  targetId: number;
  reason: string;
}

export interface Report {
  id: number;
  reporterId: number;
  targetType: string;
  targetId: number;
  reason: string;
  status: string;
  createdAt: string;
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
