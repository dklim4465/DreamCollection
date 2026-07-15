import { create } from "zustand";
import type { ChatRoom, ChatMessage } from "@/chat/types/chat";

interface ChatState {
  isOpen: boolean;
  rooms: ChatRoom[];
  activeRoomId: number | null;
  messages: Record<number, ChatMessage[]>;
  isConnected: boolean;
  toggleWidget: () => void;
  setRooms: (rooms: ChatRoom[]) => void;
  openRoom: (roomId: number) => void;
  backToList: () => void;
  setMessages: (roomId: number, messages: ChatMessage[]) => void;
  appendMessage: (message: ChatMessage, isBeingViewed: boolean) => void;
  setConnected: (connected: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  rooms: [],
  activeRoomId: null,
  messages: {},
  isConnected: false,

  toggleWidget: () => set((state) => ({ isOpen: !state.isOpen })),
  setRooms: (rooms) => set({ rooms }),
  openRoom: (roomId) => set({ activeRoomId: roomId }),
  backToList: () => set({ activeRoomId: null }),
  setMessages: (roomId, messages) =>
    set((state) => ({ messages: { ...state.messages, [roomId]: messages } })),
  appendMessage: (message, isBeingViewed) =>
    set((state) => {
      const roomMessages = state.messages[message.roomId] ?? [];

      const updatedRooms = state.rooms.map((room) =>
        room.roomId === message.roomId
          ? {
              ...room,
              lastMessage:
                message.messageType === "IMAGE"
                  ? "사진을 보냈습니다."
                  : message.content,
              lastMessageAt: message.createdAt,
              // 지금 보고 있는 방이면 안 읽음 숫자를 늘리지 않고,
              // 다른 방이면 1씩 누적한다 (카카오톡 뱃지 방식)
              unreadCount: isBeingViewed ? 0 : room.unreadCount + 1,
            }
          : room,
      );

      return {
        messages: {
          ...state.messages,
          [message.roomId]: [...roomMessages, message],
        },
        rooms: updatedRooms,
      };
    }),
  setConnected: (connected) => set({ isConnected: connected }),
}));
