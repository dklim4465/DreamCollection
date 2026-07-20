import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/auth/store/authStore";
import { useChatbotUiStore } from "@/home/store/chatbotUiStore";
import { chatbotApi, type ChatMessage } from "@/home/api/chatbotApi";
import { cityApi, type CityItem } from "@/common/api/cityApi";
import { proxyImage } from "@/common/utils/proxyImage";

// 패널이 비어있을 때 보여주는 추천 질문 칩 (mindtrip류 여행 챗봇의 "You might want to ask" 참고)
const SUGGESTED_QUESTIONS = [
  "인기 여행지 추천해줘",
  "3박4일 일정 짜줘",
  "여행 준비물 알려줘",
  "가성비 좋은 숙소 팁?",
];

// 채팅에서 도시/나라 이름이 인식됐을 때 붙는 "여기로 여행 떠나시겠어요?" 확인 카드용 부가 정보.
// (Gemini를 거치지 않고 프론트에서 바로 처리하는 데모 기능이라 서버로는 안 보냄)
interface DestinationConfirm {
  cityId: number;
  cityName: string;
  countryName: string;
  imageUrl: string | null;
  answered?: "yes" | "no";
}

type UiMessage = ChatMessage & { destinationConfirm?: DestinationConfirm };

// AI 챗봇 답변이 한 번에 너무 길게 나오면 성의 없어 보인다는 피드백이 있어서,
// 100자 단위(문장 경계를 최대한 살려서)로 잘라 여러 개의 말풍선으로 이어서 보여준다.
function splitIntoChunks(text: string, maxLen = 100): string[] {
  const sentences = text.split(/(?<=[.!?\n])\s+/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (current && (current + " " + sentence).length > maxLen) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  if (current) chunks.push(current.trim());

  // 한 문장 자체가 100자를 넘는 경우를 대비한 안전장치
  return chunks.flatMap((chunk) => hardSplit(chunk, maxLen));
}

function hardSplit(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const parts: string[] = [];
  let remaining = text;
  while (remaining.length > maxLen) {
    let cut = remaining.lastIndexOf(" ", maxLen);
    if (cut <= 0) cut = maxLen;
    parts.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) parts.push(remaining);
  return parts;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 홈페이지 AI 여행 챗봇 — 화면 오른쪽에서 전체 높이로 슬라이드해 들어오는 드로어 패널.
 * (참고: visittheusa.com의 AI 여행 플래너 패널 — 클릭 시 오른쪽에서 넓은 패널이 슬라이드인)
 * 실제 Gemini API와 연동(백엔드: GeminiChatClient).
 * 열고 닫는 상태는 useChatbotUiStore로 공유한다(전엔 상단 배너 AiPlannerBanner도 이 상태를
 * 같이 썼는데 그 배너는 죽은 코드라 삭제함 — 지금은 화면 우측 고정 탭에서만 이 패널을 연다).
 * 대화 내역은 계정별로 서버(chatbot_message 테이블)에 저장돼서, 패널을 다시 열거나
 * 새로고침해도 이어서 볼 수 있다 (패널을 처음 열 때 한 번 히스토리를 불러옴).
 * 비로그인 사용자에게는 노출하지 않음(챗봇 API가 로그인 필요).
 *
 * 데모 기능: 검색창의 "인기 여행지" 목록에 있는 도시/나라 이름을 그대로 입력하면(예: "일본",
 * "도쿄"), Gemini를 거치지 않고 그 여행지 카드 + "여기로 여행 떠나시겠어요? 네/아니요"를
 * 바로 보여준다. [네]를 누르면 그 도시 상세페이지로 이동하고, [아니요]를 누르면 카드만 닫히고
 * 대화는 계속 이어진다.
 */
export default function ChatbotWidget() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isOpen, close, toggle } = useChatbotUiStore();
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const { data: popularData } = useQuery({
    queryKey: ["cities", "popular"],
    queryFn: cityApi.getPopular,
    retry: false,
    enabled: isAuthenticated,
  });
  const popularCities = popularData?.data?.data ?? [];

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

  // 패널을 처음 열 때 딱 한 번 이전 대화 기록을 불러온다
  useEffect(() => {
    if (!isOpen || historyLoaded || !isAuthenticated) return;
    setHistoryLoaded(true);
    chatbotApi
      .getHistory()
      .then((res) => {
        const history = res.data?.data ?? [];
        if (history.length > 0) {
          setMessages(history.map((h) => ({ role: h.role, content: h.content })));
        }
      })
      .catch(() => {
        // 히스토리 로드 실패는 조용히 무시 — 그냥 빈 대화로 시작하면 됨
      });
  }, [isOpen, historyLoaded, isAuthenticated]);

  if (!isAuthenticated) return null;

  // 입력한 텍스트가 인기 여행지 목록의 도시/나라 이름과 일치하는지 찾는다 (데모용, 완전일치 위주)
  const matchDestination = (text: string): CityItem | null => {
    const trimmed = text.trim();
    if (!trimmed || popularCities.length === 0) return null;

    const exactCity = popularCities.find((c) => c.nameKo === trimmed);
    if (exactCity) return exactCity;

    // 나라 이름이면 그 나라의 대표 도시(가장 먼저 등록된 도시)로
    const countryMatch = popularCities.filter((c) => c.countryName === trimmed);
    if (countryMatch.length > 0) return countryMatch[0];

    return null;
  };

  const sendText = async (text: string) => {
    if (!text || sending) return;

    const destination = matchDestination(text);
    if (destination) {
      // 데모 기능: Gemini 호출 없이 바로 확인 카드를 보여준다
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text },
        {
          role: "assistant",
          content: `"${text}" 검색 결과예요.`,
          destinationConfirm: {
            cityId: destination.id,
            cityName: destination.nameKo,
            countryName: destination.countryName,
            imageUrl: destination.imageUrl,
          },
        },
      ]);
      setInput("");
      setError(null);
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setSending(true);
    try {
      const res = await chatbotApi.sendMessage(nextMessages);
      const reply = res.data?.data?.reply ?? "죄송해요, 답변을 받지 못했어요.";
      const chunks = splitIntoChunks(reply, 100);
      for (let i = 0; i < chunks.length; i++) {
        if (i > 0) await delay(450); // 이어서 답장하는 느낌을 주기 위한 텀
        setMessages((prev) => [...prev, { role: "assistant", content: chunks[i] }]);
      }
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

  const handleClearHistory = async () => {
    if (sending) return;
    if (!window.confirm("이전 대화 기록을 전부 지울까요?")) return;
    try {
      await chatbotApi.clearHistory();
    } catch {
      // 서버 삭제가 실패해도 화면은 비워준다 — 다음에 다시 열면 서버 기록과 다시 동기화됨
    }
    setMessages([]);
  };

  // 확인 카드의 [네] — 그 도시 상세페이지로 이동
  const handleConfirmYes = (index: number, confirm: DestinationConfirm) => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === index && m.destinationConfirm
          ? { ...m, destinationConfirm: { ...m.destinationConfirm, answered: "yes" } }
          : m
      )
    );
    close();
    navigate(`/destinations/${confirm.cityId}`);
  };

  // 확인 카드의 [아니요] — 카드만 답변 완료 처리하고, 대화는 계속 이어감
  const handleConfirmNo = (index: number) => {
    setMessages((prev) => {
      const updated = prev.map((m, i) =>
        i === index && m.destinationConfirm
          ? { ...m, destinationConfirm: { ...m.destinationConfirm, answered: "no" as const } }
          : m
      );
      return [
        ...updated,
        { role: "assistant", content: "알겠어요! 편하게 다른 것도 물어보세요." },
      ];
    });
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
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                aria-label="대화 초기화"
                title="대화 초기화"
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-xl">
                  delete_sweep
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => close()}
              aria-label="닫기"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-xl">close</span>
            </button>
          </div>
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
          {messages.map((m, i) =>
            m.destinationConfirm ? (
              <div key={i} className="self-start max-w-[85%] flex flex-col gap-2">
                <div className="w-full rounded-2xl overflow-hidden border border-outline-variant bg-surface-container-lowest">
                  <div className="relative h-32">
                    {m.destinationConfirm.imageUrl ? (
                      <img
                        src={proxyImage(m.destinationConfirm.imageUrl) ?? undefined}
                        alt={m.destinationConfirm.cityName}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-surface-container-low" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 text-white">
                      <p className="font-bold text-body-md">{m.destinationConfirm.cityName}</p>
                      <p className="text-label-sm opacity-80">{m.destinationConfirm.countryName}</p>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-body-sm mb-2.5">
                      {m.destinationConfirm.cityName}로 여행 떠나시겠어요?
                    </p>
                    {!m.destinationConfirm.answered ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleConfirmYes(i, m.destinationConfirm!)}
                          className="flex-1 btn-primary py-2 text-label-md"
                        >
                          네
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmNo(i)}
                          className="flex-1 btn-ghost py-2 text-label-md"
                        >
                          아니요
                        </button>
                      </div>
                    ) : (
                      <p className="text-label-sm text-on-surface-variant">
                        {m.destinationConfirm.answered === "yes" ? "이동할게요! 🧳" : "알겠어요, 다음에 또 물어봐주세요."}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
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
            )
          )}
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
