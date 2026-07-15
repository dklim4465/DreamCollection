export interface UserSearchResult {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  friendStatus: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "FRIEND";
}

export interface FriendRequest {
  requestId: number;
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  createdAt: string;
}

export interface Friend {
  friendshipId: number;
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
}
