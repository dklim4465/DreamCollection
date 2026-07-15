# 최종 정리 — 전체 작업 내역

이번 세션에서 진행한 작업 전체를 정리합니다: 배너 영상 코너 광고(2) / 7월 신규가입 쿠폰 이벤트(3) / 뱃지 DB 정리 / 히어로 슬라이드 문구·링크 변경(4) / 로고 고정·검색 자동완성(5) / 뱃지 도감 검색·5x2 스크롤(6) / 홈 화면 정리 및 배너 미노출 원인 수정 / 공지사항 쿠폰 연동.

---

## 0. 마지막 턴 — 홈 정리 + 배너 근본원인 수정 + 공지사항 쿠폰 연동 (최신)

### 홈 화면 정리
- 비로그인 시 뜨던 "로그인해서 추억을 저장하세요" 히어로 카드 — 바로 아래 SiteIntro와 내용이 중복이라 **완전 삭제**
- "지금 인기 있는 여행지"(`PopularDestinations`, 이미지가 빈 박스로만 나오던 섹션) 홈에서 **완전 삭제**

### 배너/코너광고가 아예 안 뜨던 원인 — 발견 및 수정
- 원인: `db/schema.sql`의 배너 시드(`여름 특가 이벤트`, `대표 홍보 영상`)가 `admin_id=1`을 하드코딩하고 있었는데, 실제 DB에는 `users.id=1`이 없어 INSERT가 FK 에러로 실패 → **banner 테이블이 통째로 비어있어서** 팝업도 코너광고도 안 뜨는 상태였음.
- 같은 위험이 있던 `monthly_destination`, `notice`, `main_background` 시드도 전부 함께 수정 — 실제 존재하는 관리자 계정을 동적으로 찾아 쓰도록 변경 (`@dc_admin_id` 세션 변수, 없으면 스킵).

### 공지사항 — 쿠폰 이벤트 연동
- **`/notices` 라우트 자체가 없었던 버그 발견**: Navbar에 "공지사항" 링크는 있었지만 실제 라우트가 없어 클릭 시 조용히 홈으로 리다이렉트되던 문제. `NoticeListPage`/`NoticeDetailPage` 신규 제작 후 라우트 등록으로 해결.
- 공지 시드를 "[이벤트] 7월 신규가입 10% / 전 회원 5% 할인 쿠폰 지급"으로 재작성 (고정글).
- 공지 상세 페이지에 **쿠폰받기 버튼** 추가: 로그인 상태에서 클릭 시 쿠폰 지급 API 호출 → 팝업으로 "10%, 5% 쿠폰이 발급되었습니다 / 보관함을 확인하세요" 노출. 신규/기존 회원 누구나 접근 가능, 비로그인이면 로그인 유도만.
- 작성/수정/삭제는 기존처럼 관리자 전용(`/api/admin/**`, `hasRole(ADMIN)`)이라 별도 조치 불필요 — 그대로 유지.

---

## 1. 항목별 변경 요약

### 2번 — 배너 영상 코너 광고
- `banner` 테이블에 `banner_type`(POPUP/CORNER_AD) 구분 추가.
- 우측 상단에 작게 뜨는 `CornerAdBanner` 컴포넌트 신규 제작 (X로 닫기, 세션 동안 유지).
- 기존 "대표 홍보 영상" 배너를 CORNER_AD로 전환.

### 3번 — 7월 신규가입 쿠폰 이벤트
- `coupon`/`user_coupon` 테이블 신설, `WELCOME10`(신규 10%) / `RETURNING5`(기존회원 5%) 쿠폰 시드.
- 회원가입(이메일/카카오) 시 `WELCOME10` 자동 지급 (`UserService`).
- 홈 진입 팝업(`AdBannerModal`)에 로그인 여부별 분기.
- 마이페이지에 **보관함** 탭 신설.
- (최신) 공지사항 상세에서도 쿠폰 지급 가능하도록 연동.

### DB 뱃지 정리
- 스키마 파일 끝의 `badge`/`user_badge` 전체 `DROP` 위험 섹션 제거.
- 국가 뱃지 6개 → **47개국**으로 확장, `WELCOME` 뱃지 추가.
- 배너/공지사항/이달의여행지/히어로배경 시드 전체의 `admin_id=1` 하드코딩 → 동적 조회로 수정 (FK 에러 근본 해결).

### 4번 — 히어로 슬라이드 문구/링크
- 3번째: "친구들과 공유하세요" / "게시판 둘러보기" → `/community`
- 4번째: "여기서 여행 친구를 찾아보세요" / "커뮤니티 둘러보기" → `/matching`

### 5번 — 로고 고정 + 검색 자동완성
- 로고 `shrink-0` 누락 수정으로 화면 크기와 무관하게 고정.
- `/api/cities/search`가 국가명도 검색되도록 수정 ("일본" → 도쿄/오사카/후쿠오카).

### 6번 — 마이페이지 뱃지 도감
- 있었지만 연결 안 됐던 초성 검색 유틸(`hangul.ts`) 연결.
- 검색창 추가(일반+초성 검색), 4열 고정 → **5열×2행 가로 스크롤**로 개편.

---

## 2. 실행 방법

```bash
# DB
mysql -u <계정> -p dreamConnection < db/schema.sql

# 백엔드
cd backend && ./gradlew bootRun

# 프론트엔드 (OneDrive 등 동기화 폴더 밖에서 실행 권장)
cd frontend && npm run dev
# → http://localhost:3000 접속 (8080은 API 서버라 화면 없음)
```

---

## 3. 전체 변경/신규 파일 목록

### DB
- `db/schema.sql`

### 백엔드
- `main/entity/Banner.java`, `main/dto/BannerResponse.java`, `main/service/BannerService.java`
- `main/controller/NoticeController.java`, `main/service/NoticeService.java`
- `admin/dto/BannerAdminRequest.java`
- `coupon/**` (entity 2, repository 2, service, controller, dto) — 신규 패키지
- `user/service/UserService.java`
- `city/repository/CityRepository.java`, `city/service/CityService.java`

### 프론트엔드
- `App.tsx` (공지사항 라우트 추가)
- `home/api/bannerApi.ts`, `home/api/noticeApi.ts`
- `home/component/CornerAdBanner.tsx` (신규), `home/component/AdBannerModal.tsx`
- `home/component/SiteIntro.tsx`
- `home/pages/HomePage.tsx`
- `notice/pages/NoticeListPage.tsx` (신규), `notice/pages/NoticeDetailPage.tsx` (신규)
- `profile/api/couponApi.ts` (신규)
- `profile/pages/ProfilePage.tsx`
- `common/layout/Logo.tsx`, `common/layout/Navbar.tsx`
- `common/utils/hangul.ts` (기존 파일, 수정 없음 — 참고용)

---

## 4. 테스트 체크리스트

- [ ] 홈 접속 시 팝업 + 코너광고 둘 다 뜨는지 (스키마 재적용 후)
- [ ] 비로그인 히어로 카드/인기여행지 섹션이 사라졌는지
- [ ] 공지사항 목록(`/notices`) 진입되는지, 상세 진입되는지
- [ ] 쿠폰 이벤트 공지에서 "쿠폰받기" 클릭 시 팝업 문구/보관함 반영 확인
- [ ] 마이페이지 보관함/뱃지도감(검색+가로스크롤) 정상 동작
- [ ] 히어로 3/4번째 슬라이드 문구·링크, 로고 크기 고정, "일본" 검색 확인

---

## 5. 남은 제약사항 / 참고

- Java 백엔드는 이 환경 네트워크 제한으로 `gradlew` 빌드를 직접 못 돌려봤습니다 (사용자 환경에서는 정상 기동 확인됨).
- city 테이블에 8개 도시만 있어 "일본" 외 대부분 나라는 검색해도 안 나올 수 있음 (실제 좌표 필요한 시드 추가 작업 별도 권장).
- 관리자 배너 등록 화면에는 아직 `banner_type` 선택 UI가 없음 (API 기본값 POPUP으로 동작은 함).
- `components/layout/Logo.tsx` / `SearchBar.tsx` / `AppLayout.tsx` / `pages/CommunityPage.tsx` / `pages/MatchingPage.tsx` / `home/component/QuickActions.tsx` / `home/component/PopularDestinations.tsx`는 실제로 안 쓰이는 죽은 파일들 — 정리 시 삭제해도 안전.

