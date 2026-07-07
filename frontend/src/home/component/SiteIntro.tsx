const FEATURES = [
  {
    icon: "photo_library",
    title: "그동안 사진 정리하느라 힘드셨죠?",
    description: "여행지별, 날짜별로 자동 정리돼요. 흩어진 사진을 한 곳에 모아보세요.",
  },
  {
    icon: "group",
    title: "이젠 저희한테 보관하세요",
    description: "용량 걱정 없이 소중한 여행 기록을 안전하게 보관해드려요.",
  },
  {
    icon: "share",
    title: "그리고 친구들과 공유하세요",
    description: "링크 하나로 여행 앨범을 공유하고, 함께한 순간을 나눠보세요.",
  },
];

/**
 * 홈 하단 서비스 소개 섹션 — 가입 전 방문자에게 서비스 가치를 짧게 전달.
 */
export default function SiteIntro() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-tertiary px-6 py-12 md:px-16 md:py-16 text-center">
      <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-14 -right-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />

      <div className="relative">
        <span className="text-white/80 text-label-sm tracking-[0.2em]">DREAM COLLECTION</span>
        <h2 className="text-white text-headline-lg md:text-display-md font-bold mt-2 mb-3">
          여행의 순간을, 오래도록
        </h2>
        <p className="text-white/85 text-body-md max-w-xl mx-auto mb-10">
          일정 계획부터 사진 보관, 친구와의 공유까지 — Dream Collection 하나로 충분해요.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center gap-3 text-white"
            >
              <span className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">{f.icon}</span>
              </span>
              <h3 className="text-headline-sm font-bold leading-snug">{f.title}</h3>
              <p className="text-label-md text-white/80">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
