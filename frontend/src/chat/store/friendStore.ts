import { create } from "zustand";
import type { Friend, FriendRequest } from "@/chat/types/friend";

interface FriendState {
  friends: Friend[];
  receivedRequests: FriendRequest[];
  setFriends: (friends: Friend[]) => void;
  setReceivedRequests: (requests: FriendRequest[]) => void;
}

export const useFriendStore = create<FriendState>((set) => ({
  friends: [],
  receivedRequests: [],
  setFriends: (friends) => set({ friends }),
  setReceivedRequests: (requests) => set({ receivedRequests: requests }),
}));
