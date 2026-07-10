import { useEffect, useState } from "react";
import { useAuthStore } from "@/auth/store/authStore";
import { useChatStore } from "@/chat/store/chatStore";
import { chatApi } from "@/chat/api/chatApi";
import {
  connectStomp,
  disconnectStomp,
  subscribeRoom,
  sendMessage,
} from "@/chat/socket/stompClient";

export default function ChatWidget() {
  const { user, isAuthenticated } = useAuthStore();
  const {
    isOpen,
    rooms,
    activeRoomId,
    messages,
    isConnected,
    toggleWidget,
    setRooms,
    openRoom,
    backToList,
    setMessages,
    appendMessage,
    setConnected,
  } = useChatStore();

  const [inputText, setInputText] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectStomp();
      setConnected(false);
      return;
    }
    connectStomp(() => {
      setConnected(true);
      chatApi.getMyRooms().then((res) => setRooms(res.data.data));
    });
    return () => disconnectStomp();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!activeRoomId || !isConnected) return;
    chatApi.getMessages(activeRoomId).then((res) => {
      setMessages(activeRoomId, res.data.data);
    });
    subscribeRoom(activeRoomId, (message) => appendMessage(message));
    chatApi.markRead(activeRoomId);
  }, [activeRoomId, isConnected]);

  const handleSend = () => {
    if (!inputText.trim() || !activeRoomId) return;
    sendMessage(activeRoomId, inputText);
    setInputText("");
  };

  if (!isAuthenticated) return null;

  const totalUnread = rooms.reduce((sum, r) => sum + r.unreadCount, 0);
  const activeMessages = activeRoomId ? (messages[activeRoomId] ?? []) : [];

  return (
    <div className="fixed bottom-44 md:bottom-24 right-8 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-80 h-[440px] bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl flex flex-col mb-3 overflow-hidden">
          <div className="px-4 py-3 border-b border-outline-variant flex items-center gap-2 bg-primary text-on-primary">
            {activeRoomId && (
              <button onClick={backToList} className="text-on-primary">
                ←
              </button>
            )}
            <strong className="text-sm">
              {activeRoomId ? "채팅" : "채팅 목록"}
            </strong>
          </div>

          {!activeRoomId && (
            <div className="flex-1 overflow-y-auto">
              {rooms.length === 0 && (
                <p className="text-center text-on-surface-variant text-sm mt-6">
                  참여 중인 채팅방이 없어요
                </p>
              )}
              {rooms.map((room) => (
                <div
                  key={room.roomId}
                  onClick={() => openRoom(room.roomId)}
                  className="px-4 py-3 border-b border-outline-variant cursor-pointer hover:bg-surface-container"
                >
                  <div className="font-semibold text-sm text-on-surface">
                    모집글 #{room.matePostId}
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    {room.lastMessage ?? "대화를 시작해보세요"}
                  </div>
                  {room.unreadCount > 0 && (
                    <span className="inline-block text-xs text-on-error bg-error rounded-full px-2 mt-1">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeRoomId && (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-1.5">
                {activeMessages.map((msg) => (
                  <div
                    key={msg.messageId}
                    className={`px-3 py-1.5 rounded-2xl max-w-[70%] text-sm ${
                      msg.senderId === user?.id
                        ? "self-end bg-primary text-on-primary"
                        : "self-start bg-surface-container text-on-surface"
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>
              <div className="flex p-2 border-t border-outline-variant gap-1.5">
                <input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="메시지 입력..."
                  className="flex-1 border border-outline-variant rounded-lg px-2 py-1.5 text-sm"
                />
                <button
                  onClick={handleSend}
                  className="bg-primary text-on-primary rounded-lg px-3 text-sm"
                >
                  전송
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <button
        onClick={toggleWidget}
        className="relative w-14 h-14 bg-primary text-on-primary rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined">chat</span>
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-error text-on-error rounded-full w-5 h-5 text-[11px] flex items-center justify-center">
            {totalUnread}
          </span>
        )}
      </button>
    </div>
  );
}
