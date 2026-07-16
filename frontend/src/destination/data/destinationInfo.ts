/**
 * 여행지 상세 페이지(CityDetailPage)용 큐레이션 콘텐츠.
 *
 * city 테이블은 이름/좌표/인기여부 같은 "마스터 데이터"만 갖고 있고,
 * 사진 갤러리나 국가별 여행 정보(환율/언어/비자 등) 같은 풍부한 콘텐츠는
 * DB에 없어서 여기에 도시별로 정적으로 큐레이션해뒀다.
 *
 * city.nameKo를 키로 매칭한다. 여기 없는 도시는 CityDetailPage가
 * city.imageUrl 1장 + 일반적인 안내 문구로 자동 폴백한다(화면이 깨지지 않음).
 *
 * 새 도시를 추가하려면: 이 파일에 같은 형태로 항목을 하나 더 추가하면 된다.
 */

export interface DestinationInfo {
  /** 상세 페이지 상단 히어로 + 갤러리에 쓸 사진들 (Unsplash 실사진, 실존 확인함) */
  gallery: string[];
  /** 한 줄 소개 */
  tagline: string;
  currency: string;
  language: string;
  plugType: string;
  visa: string;
  bestSeason: string;
  timeDiff: string;
  tips: string[];
}

export const destinationInfoMap: Record<string, DestinationInfo> = {
  도쿄: {
    gallery: [
      "https://images.unsplash.com/photo-vGx8LuMJtNo?w=1200",
      "https://images.unsplash.com/photo-1lTr__BS770?w=1200",
    ],
    tagline: "전통과 최첨단이 공존하는 일본의 심장",
    currency: "일본 엔(JPY)",
    language: "일본어",
    plugType: "A타입 (한국 콘센트와 모양이 달라 어댑터 필요)",
    visa: "관광 목적 90일 이내 무비자",
    bestSeason: "3~4월 벚꽃, 10~11월 단풍 시즌 추천",
    timeDiff: "한국과 시차 없음 (UTC+9)",
    tips: [
      "IC카드(Suica/Pasmo)를 공항에서 미리 구매하면 지하철·편의점 결제가 편해요.",
      "신주쿠·시부야는 저녁 시간대 인파가 매우 많으니 이동 동선을 미리 짜두세요.",
      "대부분의 식당이 현금만 받는 경우가 있으니 소액 엔화를 넉넉히 준비하세요.",
    ],
  },
  오사카: {
    gallery: [
      "https://images.unsplash.com/photo-1BYv3EShzwE?w=1200",
      "https://images.unsplash.com/photo-s6VthJb4lAc?w=1200",
    ],
    tagline: "먹거리와 밤거리가 매력적인 간사이의 중심",
    currency: "일본 엔(JPY)",
    language: "일본어(간사이 사투리)",
    plugType: "A타입 (한국 콘센트와 모양이 달라 어댑터 필요)",
    visa: "관광 목적 90일 이내 무비자",
    bestSeason: "3~4월 벚꽃, 9~11월 선선한 가을",
    timeDiff: "한국과 시차 없음 (UTC+9)",
    tips: [
      "도톤보리는 저녁에 방문하면 글리코상 간판 야경이 훨씬 예뻐요.",
      "오사카 주유패스를 사면 유니버설 스튜디오를 제외한 주요 명소 입장료가 대부분 포함돼요.",
      "타코야키·오코노미야키는 골목 안 로컬 가게가 대기가 짧고 가성비가 좋아요.",
    ],
  },
  후쿠오카: {
    gallery: [
      "https://images.unsplash.com/photo-RmTzKdQQvwk?w=1200",
      "https://images.unsplash.com/photo-60LrgcVi5zQ?w=1200",
      "https://images.unsplash.com/photo-mLj-3CrsEC4?w=1200",
      "https://images.unsplash.com/photo-busmtYFDR70?w=1200",
    ],
    tagline: "한국에서 가장 가까운 일본, 1박2일도 가능한 미식 도시",
    currency: "일본 엔(JPY)",
    language: "일본어",
    plugType: "A타입 (한국 콘센트와 모양이 달라 어댑터 필요)",
    visa: "관광 목적 90일 이내 무비자",
    bestSeason: "봄가을이 온화해서 여행하기 좋고, 여름엔 모모치 해변이 인기",
    timeDiff: "한국과 시차 없음 (UTC+9)",
    tips: [
      "김포/인천에서 비행시간이 1시간 남짓이라 짧은 일정에도 잘 맞아요.",
      "하카타 라멘은 극세면이 특징이라 면 삶는 정도(카타멘 등)를 취향껏 주문할 수 있어요.",
      "야타이(포장마차) 거리는 나카스 지역에 저녁부터 열려요.",
    ],
  },
  방콕: {
    gallery: [
      "https://images.unsplash.com/photo-MKVGJ4d3E6c?w=1200",
      "https://images.unsplash.com/photo-dPJom964jjc?w=1200",
      "https://images.unsplash.com/photo-wd3tQvk0WXA?w=1200",
      "https://images.unsplash.com/photo-7vWO8Rl7KvQ?w=1200",
    ],
    tagline: "사원과 야시장, 옥상 바가 어우러진 활기찬 도시",
    currency: "태국 바트(THB)",
    language: "태국어",
    plugType: "A/C/O타입 혼용 (멀티 어댑터 추천)",
    visa: "관광 목적 90일 이내 무비자",
    bestSeason: "11~2월 건기가 덥지 않고 쾌적해요",
    timeDiff: "한국보다 2시간 느림 (UTC+7)",
    tips: [
      "왓아룬은 해 질 무렵 강 건너편에서 보는 노을 야경이 가장 유명해요.",
      "그랩(Grab) 앱으로 택시/툭툭을 부르면 바가지 걱정 없이 이동할 수 있어요.",
      "한낮 기온이 매우 높으니 오전/늦은 오후 위주로 야외 일정을 잡는 게 좋아요.",
    ],
  },
  뉴욕: {
    gallery: [
      "https://images.unsplash.com/photo-ZwkXw21-uYA?w=1200",
      "https://images.unsplash.com/photo-v90EtB6l8Po?w=1200",
      "https://images.unsplash.com/photo-AFf8O1EgaMI?w=1200",
    ],
    tagline: "브로드웨이부터 센트럴파크까지, 잠들지 않는 도시",
    currency: "미국 달러(USD)",
    language: "영어",
    plugType: "A/B타입 (110V, 한국 전자제품은 변압기 필요할 수 있음)",
    visa: "ESTA(전자여행허가) 사전 신청 필수, 최대 90일 체류",
    bestSeason: "4~6월, 9~11월이 날씨가 온화하고 야외활동 하기 좋아요",
    timeDiff: "한국보다 13~14시간 느림 (서머타임에 따라 변동)",
    tips: [
      "지하철은 뉴욕 MTA 앱으로 실시간 운행 정보를 확인하는 게 편해요.",
      "브로드웨이 뮤지컬은 당일 러시 티켓/로터리로 저렴하게 구할 수 있는 경우가 있어요.",
      "팁 문화가 있어 레스토랑에서는 보통 15~20%의 팁을 추가로 지불해요.",
    ],
  },
};

/** city.nameKo로 큐레이션 정보를 찾는다. 없으면 null (페이지에서 기본값으로 폴백) */
export function getDestinationInfo(nameKo: string): DestinationInfo | null {
  return destinationInfoMap[nameKo] ?? null;
}
