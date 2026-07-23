import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/auth/store/authStore";
import { useChatStore } from "@/chat/store/chatStore";
import { useFriendStore } from "@/chat/store/friendStore";
import { chatApi } from "@/chat/api/chatApi";
import { friendApi } from "@/chat/api/friendApi";
import { reportApi } from "@/board/api/boardApi";
import type { UserSearchResult } from "@/chat/types/friends";
import type { ChatMessage } from "@/chat/types/chat";
import {
  connectStomp,
  disconnectStomp,
  subscribeRoom,
  sendMessage,
} from "@/chat/socket/stompClient";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

type WidgetTab = "chat" | "friends";

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

  const { friends, receivedRequests, setFriends, setReceivedRequests } =
    useFriendStore();

  const [inputText, setInputText] = useState("");
  const [tab, setTab] = useState<WidgetTab>("chat");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const isOpenRef = useRef(isOpen);
  const activeRoomIdRef = useRef(activeRoomId);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);
  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

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
    if (!isConnected) return;

    const handleIncomingMessage = (message: ChatMessage) => {
      const isBeingViewed =
        isOpenRef.current && activeRoomIdRef.current === message.roomId;
      appendMessage(message, isBeingViewed);
    };

    rooms.forEach((room) => {
      subscribeRoom(room.roomId, handleIncomingMessage);
    });
  }, [isConnected, rooms]);

  useEffect(() => {
    if (!activeRoomId || !isConnected) return;
    chatApi.getMessages(activeRoomId).then((res) => {
      setMessages(activeRoomId, res.data.data);
    });
    chatApi.markRead(activeRoomId);
  }, [activeRoomId, isConnected]);

  useEffect(() => {
    if (!isOpen || !isAuthenticated || tab !== "friends") return;
    loadFriendData();
  }, [isOpen, tab, isAuthenticated]);

  const loadFriendData = () => {
    friendApi.getMyFriends().then((res) => setFriends(res.data.data));
    friendApi
      .getReceivedRequests()
      .then((res) => setReceivedRequests(res.data.data));
  };

  const handleSend = () => {
    if (!inputText.trim() || !activeRoomId) return;
    sendMessage(activeRoomId, inputText, "TEXT");
    setInputText("");
  };

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !activeRoomId) return;

    setIsUploading(true);
    try {
      const res = await chatApi.uploadImage(file);
      const imageUrl = res.data.data.imageUrl;
      sendMessage(activeRoomId, imageUrl, "IMAGE");
    } catch (err) {
      console.error("이미지 업로드 실패:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearch = () => {
    if (!searchKeyword.trim()) return;
    friendApi
      .searchUsers(searchKeyword)
      .then((res) => setSearchResults(res.data.data));
  };

  const handleSendRequest = (receiverId: number) => {
    friendApi.sendRequest(receiverId).then(() => {
      setSearchResults((prev) =>
        prev.map((u) =>
          u.userId === receiverId ? { ...u, friendStatus: "PENDING_SENT" } : u,
        ),
      );
    });
  };

  const handleDecideRequest = (
    requestId: number,
    decision: "ACCEPT" | "REJECT",
  ) => {
    friendApi.decideRequest(requestId, decision).then(() => {
      loadFriendData();
    });
  };

  const handleOpenFriendChat = (friendUserId: number) => {
    chatApi.openDmRoom(friendUserId).then((res) => {
      const roomId = res.data.data;
      chatApi.getMyRooms().then((r) => setRooms(r.data.data));
      setTab("chat");
      openRoom(roomId);
    });
  };

  const handleDeleteFriend = (friendUserId: number) => {
    friendApi.deleteFriend(friendUserId).then(() => {
      loadFriendData();
    });
  };

  const resolveImageUrl = (content: string) => {
    return content.startsWith("http") ? content : `${API_BASE_URL}${content}`;
  };

  if (!isAuthenticated) return null;

  const totalUnread = rooms.reduce((sum, r) => sum + r.unreadCount, 0);
  const activeMessages = activeRoomId ? (messages[activeRoomId] ?? []) : [];
  const activeRoom = rooms.find((r) => r.roomId === activeRoomId);
  const otherUserId = activeRoom?.memberIds.find(
    (id) => Number(id) !== Number(user?.id),
  );

  const isMine = (senderId: number | string) =>
    Number(senderId) === Number(user?.id);

  const handleOpenReport = () => {
    setReportReason("");
    setShowReportModal(true);
  };

  const handleSubmitReport = () => {
    if (!reportReason.trim() || !otherUserId) return;
    setIsReporting(true);
    reportApi
      .create({
        targetType: "USER",
        targetId: otherUserId,
        reason: reportReason.trim(),
      })
      .then(() => {
        alert("신고가 접수되었습니다.");
        setShowReportModal(false);
      })
      .catch((err: any) => {
        alert(err?.response?.data?.message ?? "신고 접수에 실패했어요.");
      })
      .finally(() => setIsReporting(false));
  };

  const statusLabel = (status: UserSearchResult["friendStatus"]) => {
    switch (status) {
      case "FRIEND":
        return "친구";
      case "PENDING_SENT":
        return "요청됨";
      case "PENDING_RECEIVED":
        return "요청 받음";
      default:
        return "친구 추가";
    }
  };

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
            {!activeRoomId ? (
              <div className="flex gap-4 text-sm font-semibold">
                <button
                  onClick={() => setTab("chat")}
                  className={tab === "chat" ? "opacity-100" : "opacity-60"}
                >
                  채팅목록
                </button>
                <button
                  onClick={() => setTab("friends")}
                  className={`flex items-center gap-1 ${tab === "friends" ? "opacity-100" : "opacity-60"}`}
                >
                  친구목록
                  {receivedRequests.length > 0 && (
                    <span className="inline-flex items-center justify-center text-[10px] bg-error text-on-error rounded-full w-4 h-4">
                      {receivedRequests.length}
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <strong className="text-sm flex-1">채팅</strong>
            )}
            {activeRoomId && otherUserId != null && (
              <button
                onClick={handleOpenReport}
                className="text-on-primary text-xs opacity-80 hover:opacity-100"
                aria-label="상대방 신고"
              >
                신고
              </button>
            )}
          </div>

          {!activeRoomId && tab === "chat" && (
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
                    {room.matePostTitle}
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

          {!activeRoomId && tab === "friends" && (
            <div className="flex-1 overflow-y-auto">
              <div className="flex p-2 gap-1.5 border-b border-outline-variant">
                <input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="닉네임/이메일 검색"
                  className="flex-1 border border-outline-variant rounded-lg px-2 py-1.5 text-sm"
                />
                <button
                  onClick={handleSearch}
                  className="bg-primary text-on-primary rounded-lg px-3 text-sm"
                >
                  검색
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="border-b border-outline-variant">
                  {searchResults.map((u) => (
                    <div
                      key={u.userId}
                      className="px-4 py-2.5 flex items-center justify-between"
                    >
                      <span className="text-sm text-on-surface">
                        {u.nickname}
                      </span>
                      <button
                        disabled={u.friendStatus !== "NONE"}
                        onClick={() => handleSendRequest(u.userId)}
                        className={`text-xs rounded-lg px-2 py-1 ${
                          u.friendStatus === "NONE"
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container text-on-surface-variant"
                        }`}
                      >
                        {statusLabel(u.friendStatus)}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {receivedRequests.length > 0 && (
                <div className="border-b border-outline-variant">
                  <p className="px-4 pt-2 text-xs font-semibold text-on-surface-variant">
                    받은 친구 요청
                  </p>
                  {receivedRequests.map((req) => (
                    <div
                      key={req.requestId}
                      className="px-4 py-2.5 flex items-center justify-between"
                    >
                      <span className="text-sm text-on-surface">
                        {req.nickname}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            handleDecideRequest(req.requestId, "ACCEPT")
                          }
                          className="text-xs bg-primary text-on-primary rounded-lg px-2 py-1"
                        >
                          수락
                        </button>
                        <button
                          onClick={() =>
                            handleDecideRequest(req.requestId, "REJECT")
                          }
                          className="text-xs bg-surface-container text-on-surface-variant rounded-lg px-2 py-1"
                        >
                          거절
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <p className="px-4 pt-2 text-xs font-semibold text-on-surface-variant">
                  내 친구 ({friends.length})
                </p>
                {friends.length === 0 && (
                  <p className="text-center text-on-surface-variant text-sm mt-6">
                    아직 친구가 없어요
                  </p>
                )}
                {friends.map((f) => (
                  <div
                    key={f.friendshipId}
                    className="px-4 py-2.5 flex items-center justify-between hover:bg-surface-container"
                  >
                    <span
                      onClick={() => handleOpenFriendChat(f.userId)}
                      className="text-sm text-on-surface cursor-pointer flex-1"
                    >
                      {f.nickname}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFriend(f.userId);
                      }}
                      className="text-xs text-on-surface-variant px-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeRoomId && (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-1.5">
                {activeMessages.map((msg, index) => {
                  const prevMsg = index > 0 ? activeMessages[index - 1] : null;
                  const currentDate = new Date(msg.createdAt).toDateString();
                  const prevDate = prevMsg
                    ? new Date(prevMsg.createdAt).toDateString()
                    : null;
                  const showDateDivider = currentDate !== prevDate;

                  return (
                    <div key={msg.messageId}>
                      {showDateDivider && (
                        <div className="flex justify-center my-2">
                          <span className="text-[11px] text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">
                            {new Date(msg.createdAt).toLocaleDateString(
                              "ko-KR",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex flex-col ${
                          isMine(msg.senderId) ? "items-end" : "items-start"
                        }`}
                      >
                        {msg.messageType === "IMAGE" ? (
                          <img
                            src={resolveImageUrl(msg.content)}
                            alt="전송된 이미지"
                            className="max-w-[70%] rounded-2xl cursor-pointer"
                            onClick={() =>
                              window.open(
                                resolveImageUrl(msg.content),
                                "_blank",
                              )
                            }
                          />
                        ) : (
                          <div
                            className={`px-3 py-1.5 rounded-2xl max-w-[70%] text-sm ${
                              isMine(msg.senderId)
                                ? "bg-primary text-on-primary"
                                : "bg-surface-container text-on-surface"
                            }`}
                          >
                            {msg.content}
                          </div>
                        )}
                        <span className="text-[10px] text-on-surface-variant mt-0.5 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex p-2 border-t border-outline-variant gap-1.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelected}
                />
                <button
                  onClick={handlePickImage}
                  disabled={isUploading}
                  className="text-on-surface-variant px-1.5 disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-xl">
                    image
                  </span>
                </button>
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

      {showReportModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-sm p-5">
            <h3 className="text-base font-bold mb-2">상대방 신고하기</h3>
            <p className="text-sm text-on-surface-variant mb-3">
              신고 사유를 알려주세요. 허위 신고는 제재될 수 있어요.
            </p>
            <textarea
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm h-24 resize-none"
              placeholder="신고 사유 (최대 255자)"
              maxLength={255}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="text-sm px-3 py-1.5 text-on-surface-variant"
              >
                취소
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={!reportReason.trim() || isReporting}
                className="text-sm px-3 py-1.5 bg-primary text-on-primary rounded-lg disabled:opacity-50"
              >
                {isReporting ? "접수 중..." : "신고 접수"}
              </button>
            </div>
          </div>
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
