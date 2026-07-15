import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/auth/store/authStore";
import { useChatbotUiStore } from "@/home/store/chatbotUiStore";
import { chatbotApi, type ChatMessage } from "@/home/api/chatbotApi";

// 패널이 비어있을 때 보여주는 추천 질문 칩 (mindtrip류 여행 챗봇의 "You might want to ask" 참고)
const SUGGESTED_QUESTIONS = [
  "인기 여행지 추천해줘",
  "3박4일 일정 짜줘",
  "여행 준비물 알려줘",
  "가성비 좋은 숙소 팁?",
];

/**
 * 홈페이지 AI 여행 챗봇 — 화면 오른쪽에서 전체 높이로 슬라이드해 들어오는 드로어 패널.
 * (참고: visittheusa.com의 AI 여행 플래너 패널 — 클릭 시 오른쪽에서 넓은 패널이 슬라이드인)
 * 실제 Gemini API와 연동(백엔드: GeminiChatClient).
 * 열고 닫는 상태는 useChatbotUiStore로 공유해서, 상단 배너(AiPlannerBanner)의
 * "AI에게 물어보기" 버튼과 화면 우측 고정 탭이 같은 패널을 제어한다.
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

  // 패널이 열려 있는 동안 배경 스크롤 잠금 (실제 앱 느낌)
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isAuthenticated) return null;

  const sendText = async (text: string) => {
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

  const handleSend = () => sendText(input.trim());

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* 화면 오른쪽 끝 고정 탭 — 패널이 닫혀 있을 때만 노출 */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => toggle()}
          aria-label="AI 챗봇 열기"
          className="fixed top-1/2 right-0 -translate-y-1/2 z-[90] bg-gradient-to-b from-neutral-900/90 to-neutral-800/90 backdrop-blur text-white rounded-l-2xl shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5)] flex flex-col items-center gap-2.5 py-5 px-2.5 hover:pr-3.5 transition-all"
        >
          <span className="material-symbols-outlined text-xl">auto_awesome</span>
          <span
            className="text-label-sm font-bold tracking-wider"
            style={{ writingMode: "vertical-rl" }}
          >
            AI 챗봇
          </span>
        </button>
      )}

      {/* 뒷배경 살짝 어둡게 (클릭하면 닫힘) */}
      <div
        onClick={() => close()}
        className={`fixed inset-0 bg-black/30 z-[94] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* 오른쪽에서 슬라이드해 들어오는 전체 높이 드로어 패널 */}
      <div
        className={`fixed top-0 right-0 h-screen w-full sm:w-[420px] md:w-[460px] z-[95] bg-surface-container-lowest shadow-[-20px_0_60px_-12px_rgba(0,0,0,0.35)] flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant bg-gradient-to-r from-primary-container to-surface-container-lowest shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
            </span>
            <div>
              <p className="text-label-md font-bold leading-tight">Dream Collection AI</p>
              <p className="text-label-sm text-on-surface-variant leading-tight">여행 플래너</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => close()}
            aria-label="닫기"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-xl">close</span>
          </button>
        </div>

        {/* 메시지 영역 */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center text-center mt-10 mb-2 gap-3">
              <span className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-primary">travel_explore</span>
              </span>
              <p className="text-body-md text-on-surface-variant px-6">
                여행지 추천, 일정 준비물, 뭐든 편하게 물어보세요!
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-body-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "self-end bg-primary text-on-primary rounded-br-sm"
                  : "self-start bg-surface-container-low text-on-surface rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          ))}
          {sending && (
            <div className="self-start bg-surface-container-low text-on-surface-variant px-4 py-2.5 rounded-2xl text-body-sm">
              답변을 작성하고 있어요...
            </div>
          )}
        </div>

        {/* 추천 질문 칩 — mindtrip류 "물어볼 만한 질문" 참고, 대화가 아직 없을 때만 노출 */}
        {messages.length === 0 && (
          <div className="px-5 pb-3 shrink-0">
            <p className="text-label-sm font-bold text-on-surface-variant mb-2">이런 걸 물어보세요</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendText(q)}
                  disabled={sending}
                  className="text-label-sm px-3 py-1.5 rounded-full border border-outline-variant bg-surface-container-low hover:bg-surface-container-high transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-label-sm text-error px-5 pb-1 shrink-0">{error}</p>}

        {/* 입력창 — 둥근 알약 모양 + 원형 전송 버튼 */}
        <div className="p-4 border-t border-outline-variant shrink-0">
          <div className="flex items-center gap-2 bg-surface-container-low rounded-full pl-4 pr-1.5 py-1.5 border border-outline-variant">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="무엇이든 물어보세요"
              className="flex-1 bg-transparent outline-none text-body-sm placeholder:text-on-surface-variant"
              disabled={sending}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !input.trim()}
              aria-label="전송"
              className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-primary text-on-primary disabled:opacity-40 transition-opacity"
            >
              <span className="material-symbols-outlined text-lg">arrow_upward</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
