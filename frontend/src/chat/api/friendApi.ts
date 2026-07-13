import apiClient from "@/api/client";
import type { ApiResponse } from "@/types";
import type {
  UserSearchResult,
  FriendRequest,
  Friend,
} from "@/chat/types/friend";

export const friendApi = {
  searchUsers: (keyword: string) =>
    apiClient.get<ApiResponse<UserSearchResult[]>>("/friends/search", {
      params: { keyword },
    }),
  sendRequest: (receiverId: number) =>
    apiClient.post<ApiResponse<void>>(`/friends/requests/${receiverId}`),
  getReceivedRequests: () =>
    apiClient.get<ApiResponse<FriendRequest[]>>("/friends/requests/received"),
  decideRequest: (requestId: number, decision: "ACCEPT" | "REJECT") =>
    apiClient.patch<ApiResponse<void>>(`/friends/requests/${requestId}`, null, {
      params: { decision },
    }),
  getMyFriends: () => apiClient.get<ApiResponse<Friend[]>>("/friends"),
  deleteFriend: (friendUserId: number) =>
    apiClient.delete<ApiResponse<void>>(`/friends/${friendUserId}`),
};
