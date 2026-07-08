import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/auth/store/authStore";
import { useChatbotUiStore } from "@/home/store/chatbotUiStore";
import { chatbotApi, type ChatMessage } from "@/home/api/chatbotApi";

/**
 * 홈페이지 AI 여행 챗봇 패널.
 * 실제 Anthropic Claude API와 연동(백엔드: AnthropicChatClient).
 * 열고 닫는 상태는 useChatbotUiStore로 공유해서, 상단 배너(AiPlannerBanner)의
 * "AI에게 물어보기" 버튼과 우측 하단 플로팅 버튼이 같은 패널을 제어한다.
 * 대화 내역은 새로고침하면 사라짐(서버에 저장 안 함, 매 요청마다 지금까지의 대화를 통째로 전송).
 * 비로그인 사용자에게는 노출하지 않음(챗봇 API가 로그인 필요).
 */
export default function ChatbotWidget() {
  const { isAuthenticated } = useAuthStore();
  const { isOpen, close, toggle } = useChatbotUiStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isOpen, sending]);

  if (!isAuthenticated) return null;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setSending(true);
    try {
      const res = await chatbotApi.sendMessage(nextMessages);
      const reply = res.data?.data?.reply ?? "죄송해요, 답변을 받지 못했어요.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setError("메시지를 보내지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed top-1/2 right-0 -translate-y-1/2 z-[90] flex flex-col items-end gap-3">
      {isOpen && (
        <div className="mr-4 w-80 sm:w-96 h-[480px] bg-surface-container-lowest rounded-3xl shadow-[0_12px_40px_-8px_rgba(0,0,0,0.35)] border border-outline-variant flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant bg-primary-container">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              <p className="text-label-md font-bold">Dream Collection 여행 챗봇</p>
            </div>
            <button
              type="button"
              onClick={() => close()}
              aria-label="닫기"
              className="material-symbols-outlined text-on-surface-variant"
            >
              close
            </button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
            {messages.length === 0 && (
              <p className="text-body-sm text-on-surface-variant text-center mt-8">
                여행지 추천, 일정 준비물, 뭐든 편하게 물어보세요!
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-4 py-2 rounded-2xl text-body-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "self-end bg-primary text-on-primary rounded-br-sm"
                    : "self-start bg-surface-container-low text-on-surface rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <div className="self-start bg-surface-container-low text-on-surface-variant px-4 py-2 rounded-2xl text-body-sm">
                답변을 작성하고 있어요...
              </div>
            )}
          </div>

          {error && <p className="text-label-sm text-error px-4 pb-1">{error}</p>}

          <div className="flex items-center gap-2 p-3 border-t border-outline-variant">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요"
              className="input-base flex-1"
              disabled={sending}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
            >
              전송
            </button>
          </div>
        </div>
      )}

      {/* 참고 사이트의 우측 세로 탭(언어 선택 바) 스타일 — 화면 오른쪽 끝에 붙은 세로 탭 */}
      <button
        type="button"
        onClick={() => toggle()}
        aria-label="AI 챗봇 열기"
        className="bg-primary text-on-primary rounded-l-2xl shadow-[0_8px_24px_-6px_rgba(0,0,0,0.4)] flex flex-col items-center gap-2 py-4 px-2.5 hover:pr-3.5 transition-all"
      >
        <span className="material-symbols-outlined text-xl">
          {isOpen ? "close" : "auto_awesome"}
        </span>
        {!isOpen && (
          <span
            className="text-label-sm font-bold tracking-wider"
            style={{ writingMode: "vertical-rl" }}
          >
            AI 챗봇
          </span>
        )}
      </button>
    </div>
  );
}
