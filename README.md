# ✈️ Dream Collection — 여행 기록 통합 관리 플랫폼

여행 전(일정 생성·동행 매칭)부터 여행 후(사진·영수증 정리, 커뮤니티 공유)까지, AI 기반 자동 정리 기능과 함께 하나의 서비스에서 관리할 수 있도록 만든 풀스택 팀 프로젝트입니다.

---

## 📌 프로젝트 개요 (Overview)

최근 여행 수요가 늘면서 여행 후 정리해야 하는 사진·일정·지출 기록도 함께 늘고 있습니다. 하지만 대부분의 사진은 다시 보지 않거나 정리되지 않은 채 남아있고, 일정과 영수증도 따로 관리해야 하는 불편함이 있습니다.

기존 여행 서비스는 여행 전 일정 관리에 집중되어 있는 반면, Dream Collection은 여행이 끝난 이후까지 이어지는 기록을 **AI로 자동 정리**하고 **한곳에서 관리**할 수 있도록 만든 통합 여행 관리 서비스입니다.

- **AI 여행 일정 생성**: 조건만 입력하면 실제 존재하는 장소로 구성된 일정을 자동 생성
- **여행 사진 자동 정리**: 위치·시간 메타데이터로 사진을 자동 그룹핑해 여행 기록 생성
- **영수증 OCR 정산**: 사진 한 장으로 날짜·금액을 인식해 여행 경비 자동 정리
- **동행 매칭 + 실시간 채팅**: 성향 기반 메이트 추천과 WebSocket 채팅
- **커뮤니티**: 게시판, 레벨/뱃지, 알림, 신고

---

## 🛠️ 주요 기술 스택 (Tech Stack)

| 항목 | 내용 |
| --- | --- |
| Backend | Java 21, Spring Boot 3.5 (Web, Data JPA, Validation, Security) |
| Database | MySQL 8 / MariaDB 10.6+ |
| Auth | JWT (jjwt) + Refresh Token, 카카오 소셜 로그인 |
| Realtime | WebSocket (STOMP) |
| AI Server | FastAPI (Flask → FastAPI 마이그레이션), Gemini API, OpenAI API, PaddleOCR |
| Frontend | React 18, TypeScript, Vite |
| Frontend 상태/통신 | TanStack Query, Zustand, React Hook Form |
| Build/Tool | Gradle, Lombok, Git/GitHub |

---

## 👥 팀 소개

| 이름 | 담당 |
| --- | --- |
| 임대한 (팀장) | 여행 일정, 여행 기록(travelog) |
| 이민주 | 게시판, 여행 메이트, 실시간 채팅 |
| 복영재 | 회원 관리/인증, 메인 페이지, 관리자 |

---

## 📁 패키지 구조

```
DreamCollection/
├── backend/
│   └── src/main/java/com/dreamCollection/
│       ├── BackendApplication.java     # 진입점
│       ├── admin/                      # 관리자 기능
│       ├── auth/                       # 인증
│       ├── badge/                      # 뱃지 · 레벨
│       ├── board/                      # 게시판
│       ├── chat/                       # 실시간 채팅 (STOMP)
│       ├── city/                       # 여행지 정보
│       ├── mate/                       # 동행(메이트) 매칭
│       ├── main/                       # 메인 페이지
│       ├── social/                     # 알림, 차단/신고
│       ├── stats/                      # 통계
│       ├── trip/                       # AI 여행 일정
│       ├── travelog/                   # 여행 기록, 영수증
│       ├── user/                       # 회원
│       └── global/                     # 공통 (security, exception, response)
│
├── ai-server/                          # FastAPI (Gemini/OpenAI/PaddleOCR)
│
└── frontend/
    └── src/
        ├── App.tsx
        ├── auth/ home/ payment/ profile/ records/ admin/ common/
        ├── pages/Trip/                 # 여행 일정
        ├── board/                      # 게시판
        ├── mate/                       # 메이트 매칭
        └── chat/                       # 실시간 채팅
```

## 🔗 주요 API 엔드포인트

| 메서드 | 경로 | 설명 | 인증 |
| --- | --- | --- | --- |
| GET | `/api/auth/me`, `/api/users/me` | 내 정보 조회 (새로고침 시 로그인 상태 복구용) | 필요 |
| PATCH | `/api/users/me` | 프로필 수정 (닉네임/프로필이미지/여행스타일, 값 있는 필드만 반영) | 필요 |
| GET | `/api/badges/me` | 내 뱃지 목록 (획득/미획득 전부 + 대표 여부) | 필요 |
| PATCH | `/api/badges/me/representative/{badgeId}` | 대표 뱃지 지정 | 필요 |
| DELETE | `/api/badges/me/representative` | 대표 뱃지 해제 | 필요 |
| GET | `/api/stats` | 홈 화면 통계(등록된 여행 일정/유저/여행일지/지원 국가 수) | 공개 |
| GET | `/api/images/proxy?url=` | 외부 이미지 프록시 (허용 도메인만) | 공개 |

---

## ⚙️ 주요 기능

| 기능 | 설명 |
| --- | --- |
| AI 여행 일정 생성 | 조건 입력 → Gemini API로 관광지·숙소 포함 일정 자동 생성, Place ID 검증 |
| 여행 사진 자동 정리 | 사진 메타데이터(위치·시간) 분석 후 자동 그룹핑, GPS 없으면 시간 기준으로만 그룹핑 |
| 영수증 OCR 정산 | PaddleOCR 텍스트 추출 → OpenAI가 날짜/금액 분석 → 여행 경비 자동 정산 |
| 회원 인증 | JWT + Refresh Token 자동 로그인, 카카오 소셜 로그인 |
| 게시판 | 글 작성/수정/삭제, 댓글·대댓글, 좋아요, 카테고리 조회, 페이징 |
| 메이트 매칭 | AI 성향 기반 추천, 신청/수락/거절/취소, 여행 시작일 이후 후기 작성, 후기 리마인드 스케줄러 |
| 실시간 채팅 | WebSocket(STOMP) 기반, 읽지 않은 메시지 뱃지, 날짜 구분선 |
| 레벨 · 뱃지 | 여행 기록 수 기반 레벨 자동 계산, 대표 뱃지 지정 |
| AI 챗봇 | 이전 대화 맥락을 포함한 연속 대화 |
| 알림 · 신고 | 메이트 수락/거절, 후기 리마인드, 댓글 알림, 신고 처리 |

---

## 🏗️ 핵심 설계

### 1. AI 서버를 별도 FastAPI로 분리한 이유

AI 기능(일정 생성, OCR, 추천, 챗봇)은 Gemini/OpenAI/PaddleOCR 등 외부 AI 연동이 잦고 Python 생태계 라이브러리 의존도가 높습니다. Spring Boot와 같은 서버에 두면 배포·장애 범위가 뒤섞이기 때문에, FastAPI로 AI 서버를 분리해 Spring Boot는 요청을 검증·전달하고 결과를 저장하는 역할만 담당하도록 설계했습니다.

```
Client → Spring Boot → FastAPI(AI 서버) → Gemini/OpenAI API
                ↑                                │
                └──────── 결과 저장 ◀───────────┘
```

### 2. 레벨/뱃지 정보를 도메인별로 독립시킨 이유

게시판과 메이트 도메인 모두 목록에 작성자의 레벨/뱃지를 표시해야 했습니다. `user` 패키지에 공용으로 두는 대신, 각 도메인(`board`, `mate`) 안에 `AuthorLevelBadgeInfo`를 독립적으로 두어 도메인 간 결합도를 낮췄습니다. 단, 이 과정에서 동일한 이름의 `@Service` 클래스가 서로 다른 패키지에 생기며 빈 이름 충돌이 발생해, `BoardAuthorLevelBadgeService`/`MateAuthorLevelBadgeService`로 이름을 분리했습니다. (아래 트러블슈팅 참고)

### 3. 실시간 채팅 인증/발행 구조

STOMP CONNECT 시점에 `ChannelInterceptor`가 JWT를 검증하고 인증 정보를 세션에 심어두며, 메시지 발행은 컨트롤러가 `SimpMessagingTemplate`으로 실제 방 경로(`/sub/rooms/{roomId}`)를 직접 조립해 보내는 구조로 설계했습니다. 이는 Spring의 `@SendTo` 어노테이션이 STOMP 경로 변수를 실제 값으로 치환해주지 않는다는 점을 확인한 뒤 채택한 방식입니다.

---

## 🧩 트러블슈팅 (Troubleshooting)

| 문제 | 원인 | 해결 방법 |
| --- | --- | --- |
| 실시간 채팅 메시지가 상대방 화면에 안 뜸 | `@SendTo("/sub/rooms/{roomId}")`가 경로 변수를 실제 값으로 치환하지 않아 엉뚱한 주소로 발행됨 | `SimpMessagingTemplate.convertAndSend()`로 실제 경로를 직접 조립해 발행 |
| STOMP 인증 정보가 세션에 반영 안 됨 | `StompHeaderAccessor.wrap()`이 새 accessor 객체를 만들어 `setUser()` 결과가 원본 메시지에 반영되지 않음 | `MessageHeaderAccessor.getAccessor()`로 원본 accessor를 직접 사용 |
| 서버 기동 시 `ConflictingBeanDefinitionException` | board/mate 패키지에 동일한 이름의 `@Service` 클래스가 존재 (Spring 빈 이름은 패키지를 구분하지 않음) | `BoardAuthorLevelBadgeService`/`MateAuthorLevelBadgeService`로 클래스명 분리 |
| 비로그인 사용자의 게시글 작성 요청이 서버까지 도달 (500) | `SecurityConfig`의 `PUBLIC_URLS`에 `/api/board/posts/**`가 모든 HTTP 메서드에 대해 permitAll로 설정됨 | GET만 허용하는 `PUBLIC_GET_URLS`로 분리, POST/PUT/DELETE는 인증 필요 |
| 머지 이후 다른 유저의 사진이 안 보임 | 이미지 경로가 `/uploads/**`(복수형)만 화이트리스트 등록, 신규 업로드는 `/upload/**`(단수형) 사용 | `/upload/**` 경로를 화이트리스트에 추가 |
| 메이트 신청을 취소해도 채팅방 접근 가능 | 채팅방 멤버십 여부만 검증하고 신청 취소 여부는 검증하지 않음 | 방장이거나 여전히 유효한 신청 건이 있는지 추가 검증 로직 반영 |
| AI 일정 생성이 계속 실패/반복 | OpenAI API Key 누락으로 AI 서버가 정상적으로 기동하지 않음 | API Key 환경변수 추가 |
| GPS 정보 없는 사진에서 오류 발생 | 위치 데이터 없이 지도 표시 로직이 그대로 실행됨 | GPS 없으면 지도 표시는 제외하고 시간 정보만으로 그룹핑 |

---

## 🖥️ 실행 화면 (Test Cases)

### Test Case 1 — 회원가입 / 로그인

> 이메일 또는 카카오 소셜 로그인 → JWT 발급 → 로그인 

![회원가입/로그인](docs/gifs/auth.gif)

### Test Case 2 — AI 여행 일정 생성

> 여행 조건 입력 → AI가 관광지·숙소 포함 일정 자동 생성

![AI 일정 생성](docs/gifs/ai-trip.gif)

### Test Case 3 — 여행 사진 자동 정리

> 사진 업로드 → 위치·시간 기준으로 자동 그룹핑되어 여행 기록 생성

![여행 기록 자동 정리](docs/gifs/travelog.gif)

### Test Case 4 — 영수증 OCR 정산

> 영수증 사진 업로드 → 날짜/금액 자동 인식 → 여행 경비 정산

![영수증 OCR](docs/gifs/ocr.gif)

### Test Case 5 — 게시판 CRUD

> 글 작성/수정/삭제, 댓글·좋아요, 카테고리 조회

![게시판](docs/gifs/board.gif)

### Test Case 6 — 메이트 매칭 신청 / 수락

> 동행 모집 글에 신청 → 방장이 수락 → 채팅방 생성

![메이트 매칭](docs/gifs/mate.gif)

### Test Case 7 — 메이트 모집글 국가별 필터링

> 여행 국가를 선택하면 해당 국가의 모집 글만 걸러서 보여줌

![메이트 매칭](docs/gifs/mate.gif)

### Test Case 8 — AI 메이트 추천

> 내 여행 성향과 모집 글을 분석해 적합한 메이트를 추천 (모집 종료/본인 글은 제외)

![메이트 매칭](docs/gifs/mate.gif)

### Test Case 9 — 실시간 채팅

> WebSocket(STOMP) 기반 실시간 메시지 송수신

![실시간 채팅](docs/gifs/chat.gif)

### Test Case 10 — AI 챗봇

> 이전 대화 맥락을 포함한 연속 대화

![AI 챗봇](docs/gifs/chatbot.gif)

---

## 🚀 실행 방법

### 백엔드
1. Java 21 설치 (`temurin-21` 권장), MySQL/MariaDB 실행 중이어야 함
2. 팀에서 공유하는 통합 SQL 스크립트 실행 (테이블 생성 + 시드 데이터, 뱃지/레벨 포함)
3. `backend/.env` 생성 (DB 계정, JWT Secret, 메일/카카오 등)
4. IntelliJ에서 `backend` 폴더 열고 Gradle sync → SDK/Gradle JVM 21 확인 → `BackendApplication` 실행
5. 콘솔에 `Tomcat started on port(s): 8080` 확인

**재실행 시 자주 겪는 문제**
- `Port XXXX was already in use` → 이전 실행이 안 꺼진 상태. `netstat -ano | findstr :8080` 후 `taskkill /PID <번호> /F`, 또는 IntelliJ Run Configuration에서 "Single instance only" 체크
- `Unable to load authentication plugin 'auth_gssapi_client'` / `GSS-API authentication exception` → DB 드라이버가 실제 DB(MariaDB/MySQL)와 안 맞음 (위 "DB 드라이버 관련 주의" 참고)
- 이메일/SMS 인증번호가 안 옴 → `.env`의 `MAIL_PASSWORD`(Gmail 앱 비밀번호, 공백 제거)/`SOLAPI_*` 값 확인

### AI 서버
```bash
cd ai-server
pip install -r requirements.txt
uvicorn app:app --reload
```

### 프론트엔드
```bash
cd frontend
npm install
npm run dev
```
`http://localhost:3000`에서 확인 (Vite 프록시로 `/api` → `http://localhost:8080`)

- 이미지가 안 보이면 브라우저 광고차단 확장 프로그램이 외부 이미지(Unsplash)를 막는 경우가 있습니다 → 백엔드의 `/api/images/proxy`를 통해 받아오도록 처리되어 있어 대부분 해결되지만, 그래도 안 보이면 시크릿 모드로 확인해보세요.

---

## 💡 알아두면 좋은 것들

- **로그인 상태 복구**: 새로고침해도 로그인이 풀린 것처럼 보이면 `App.tsx`의 `AuthBootstrap`이 `/api/auth/me`를 호출해서 유저 정보를 다시 채워넣습니다. 관련 로직을 건드릴 땐 `authStore.ts`의 `hydrateUser`/`setUser` 차이를 참고하세요 (`hydrateUser`는 토큰 안 건드리고 user만 갱신, `setUser`는 로그인 성공 시 토큰까지 같이 저장).
- **대표 뱃지**: `user_badge.is_representative`는 유저당 최대 1개만 true여야 합니다 — `BadgeService.setRepresentative()`가 기존 대표를 자동으로 해제하고 새로 지정하니, 이 로직을 우회해서 직접 DB를 만지지 않도록 주의하세요.
- **이미지 프록시**: `/api/images/proxy`는 화이트리스트에 있는 호스트(`images.unsplash.com`)만 대신 요청해줍니다. 다른 이미지 CDN을 추가로 쓰려면 `ImageProxyController.ALLOWED_HOSTS`에 도메인을 추가해야 합니다.

---

## 🌿 브랜치 / 커밋 규칙

- 작업 전 `git pull origin <브랜치명>`으로 최신 상태 받고 시작하는 걸 권장합니다.
- 커밋 메시지 예시: `feat(trip): AI 추천 요청 생성 API 추가`, `fix(home): 히어로 배너 슬라이드 인디케이터 위치 수정`
- merge 시 충돌 마커(`<<<<<<<`, `=======`, `>>>>>>>`)가 파일에 남아있지 않은지 커밋 전에 꼭 확인하세요.

---

## 📐 설계 원칙

- FK는 `@ManyToOne` 연관관계 대신 `Long` 필드로 단순하게 처리
- 모든 Entity는 `@NoArgsConstructor(PROTECTED)` + `@Builder` 조합, `Entity.builder()...build()`로 생성
- `created_at`은 `@CreationTimestamp`로 자동 채움
- API 응답은 `ApiResponse<T>` (`{ success, data, message }`) 형태로 통일
- 인증은 `@AuthenticationPrincipal Long userId`로 통일 (`X-User-Id` 헤더 방식에서 마이그레이션 완료)
