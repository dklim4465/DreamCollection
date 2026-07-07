// ──────────────────────────────────────
// Board (게시판) 도메인 타입
// 백엔드 com.dreamCollection.board.dto 패키지와 1:1 매칭
// ──────────────────────────────────────

// 백엔드에서 확인된 값: "TRANSFER" (예약양도) 카테고리 생성 시 tradeStatus가 자동으로 "ON_SALE"이 됨.
// "FREE"(자유), "REVIEW"(후기)는 BoardPost.java 주석("예약양도/자유/후기") 기준 추정값.
// 실제 팀에서 사용 중인 값과 다르면 이 세 값만 맞춰주면 나머지 코드는 그대로 동작함.
export const BOARD_CATEGORIES = ["FREE", "TRANSFER", "REVIEW"] as const;
export type BoardCategory = (typeof BOARD_CATEGORIES)[number];

export const BOARD_CATEGORY_LABELS: Record<BoardCategory, string> = {
  FREE: "자유",
  TRANSFER: "예약양도",
  REVIEW: "후기",
};

// tradeStatus: TRANSFER 게시글에서만 의미 있음. 백엔드에서 확정된 건 "ON_SALE" 뿐이라
// "SOLD_OUT"은 추정값 — 실제 거래완료 상태값이 다르면 여기와 BoardWritePage의 select만 고치면 됨.
export const TRADE_STATUSES = ["ON_SALE", "SOLD_OUT"] as const;
export type TradeStatus = (typeof TRADE_STATUSES)[number];

export const TRADE_STATUS_LABELS: Record<string, string> = {
  ON_SALE: "판매중",
  SOLD_OUT: "거래완료",
};

// GET /api/board/posts (목록) 응답 — BoardPostListResponseDTO
export interface BoardPostListItem {
  id: number;
  category: string;
  title: string;
  price: number | null;
  viewCount: number;
  likeCount: number;
  tradeStatus: string | null;
  createdAt: string;
}

// GET/POST/PUT /api/board/posts/{id} 응답 — BoardPostDetailResponseDTO
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
}

// POST /api/board/posts 요청 — BoardPostCreateRequestDTO
export interface BoardPostCreateRequest {
  category: string;
  title: string;
  content: string;
  price?: number | null;
}

// PUT /api/board/posts/{id} 요청 — BoardPostUpdateRequestDTO
export interface BoardPostUpdateRequest {
  title: string;
  content: string;
  price?: number | null;
  tradeStatus?: string | null;
}

// BoardCommentResponseDTO
export interface BoardComment {
  id: number;
  postId: number;
  userId: number;
  parentCommentId: number | null;
  content: string;
  createdAt: string;
}

// BoardCommentCreateRequestDTO
export interface BoardCommentCreateRequest {
  content: string;
  parentCommentId?: number | null;
}

// BoardCommentUpdateRequestDTO
export interface BoardCommentUpdateRequest {
  content: string;
}

// BoardLikeResponseDTO
export interface BoardLikeResult {
  liked: boolean;
  likeCount: number;
}

// BoardImageResponseDTO
export interface BoardImage {
  id: number;
  postId: number;
  imageUrl: string;
  orderNo: number | null;
}

// BoardImageCreateRequestDTO
export interface BoardImageCreateRequest {
  imageUrl: string;
  orderNo?: number | null;
}

// 신고 대상 타입 — 백엔드 ReportService.ALLOWED_TARGET_TYPES 와 동일해야 함
export type ReportTargetType = "POST" | "COMMENT" | "USER";

// ReportCreateRequestDTO
export interface ReportCreateRequest {
  targetType: ReportTargetType;
  targetId: number;
  reason: string;
}

// ReportResponseDTO
export interface Report {
  id: number;
  reporterId: number;
  targetType: string;
  targetId: number;
  reason: string;
  status: string;
  createdAt: string;
}

// Spring Data의 Page<T> 실제 JSON 직렬화 형태.
// types/index.ts의 PageResponse<T>는 필드명이 실제 Spring 응답과 달라서(page vs number) 게시판 전용으로 따로 정의함.
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // 현재 페이지 (0부터 시작)
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
