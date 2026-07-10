export interface ChatRoom {
  roomId: number;
  matePostId: number;
  memberIds: number[];
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface ChatMessage {
  messageId: number;
  roomId: number;
  senderId: number;
  content: string;
  messageType: "TEXT" | "IMAGE";
  createdAt: string;
}
