import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/auth/store/authStore";
import { useChatbotUiStore } from "@/home/store/chatbotUiStore";

// 무드있는 야간 여행 사진 (참고: visittheusa.com 스타일 — 어두운 사진 위에 큼직한 헤드라인)
const BANNER_IMAGE_URL =
  "https://images.unsplash.com/photo-1758473788156-e6b2ae00c77d?auto=format&fit=crop&w=1920&q=80";

/**
 * "AI와 함께 여행을 계획해 보세요" 홈페이지 배너.
 * visittheusa.com 참고 — 화면 꽉 채운 무드있는 사진 + 진한 다크 오버레이 + 크고 굵은 헤드라인.
 * 클릭하면 ChatbotWidget의 대화 패널을 연다(같은 useChatbotUiStore 공유).
 * 비로그인 사용자는 로그인 페이지로 보낸다(챗봇 API가 로그인 필요).
 */
export default function AiPlannerBanner() {
  const { isAuthenticated } = useAuthStore();
  const { open } = useChatbotUiStore();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    open();
  };

  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen h-[420px] md:h-[520px] overflow-hidden">
      <img
        src={BANNER_IMAGE_URL}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* 왼쪽은 진하게, 오른쪽으로 갈수록 옅어지는 다크 그라데이션 — 텍스트 가독성 + 무드 */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      <div className="relative h-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col items-start justify-center">
        <p className="text-white/70 text-label-sm tracking-[0.3em] uppercase mb-4">
          AI Trip Planner
        </p>
        <h2 className="text-white text-[36px] md:text-[56px] font-black leading-[1.05] max-w-2xl mb-5 drop-shadow-lg">
          AI와 함께
          <br />
          여행을 계획해 보세요
        </h2>
        <p className="text-white/80 text-body-md max-w-md mb-8">
          목적지, 일정, 취향만 알려주면 Dream Collection의 AI 챗봇이 나만을 위한 여행을 바로 제안해드려요.
        </p>
        <button
          type="button"
          onClick={handleClick}
          className="inline-flex items-center gap-2 bg-white text-on-surface text-sm font-bold py-4 px-8 rounded-full shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5)] hover:scale-105 transition-all"
        >
          <span className="material-symbols-outlined text-lg">smart_toy</span>
          AI에게 물어보기
        </button>
      </div>
    </section>
  );
}
