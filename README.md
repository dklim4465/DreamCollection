# Dream Collection

여행 일정 계획 · 동행 매칭 · 여행 기록 커뮤니티 플랫폼입니다.
Spring Boot 백엔드 + React(Vite) 프론트엔드로 구성된 풀스택 프로젝트입니다.

## 기술 스택

**백엔드**
- Java 21
- Spring Boot 3.5 (Web, Data JPA, Validation, Security)
- MySQL 8 / MariaDB 10.6+ (드라이버는 실제 서버에 맞춰 선택 — 아래 "DB 접속 정보" 참고)
- JWT (jjwt)
- Gradle (Groovy)
- Lombok
- `springboot3-dotenv` — `backend/.env` 파일을 자동으로 읽어서 환경변수로 주입

**프론트엔드**
- React 18 + TypeScript + Vite
- React Router, TanStack Query (React Query)
- Zustand (상태관리), Tailwind CSS
- React Hook Form

## 폴더 구조

```
DreamCollection/
├── backend/
│   ├── build.gradle
│   ├── settings.gradle
│   ├── .env                              # DB/메일/SMS/OAuth 비밀값 (git 제외, 직접 생성 필요)
│   └── src/main/
│       ├── java/com/dreamCollection/
│       │   ├── BackendApplication.java   # 메인 실행 클래스
│       │   ├── admin/ auth/ badge/ board/ chat/ city/ mate/ main/ social/ stats/ trip/ travelog/ user/ verification/
│       │   └── global/                   # 공통 코드 (security, exception, response, image 프록시)
│       └── resources/
│           └── application.yml           # 실제 서버 설정 (DB, 메일, SMS, JWT, CORS 등) — 여기가 진짜
│
└── frontend/
    ├── package.json
    ├── .env                              # VITE_* 환경변수 (필요 시, 없어도 기본값으로 동작)
    └── src/
        ├── App.tsx                    # 라우팅 정의 + 새로고침 시 로그인 정보 복구(AuthBootstrap)
        ├── auth/                      # 로그인/회원가입/카카오 로그인
        ├── home/                      # 메인페이지 (스크롤텔링 히어로, 인기 여행지 캐러셀 등)
        ├── pages/Trip/, components/trip/  # 여행 일정(trip) — 별도 담당자가 직접 관리
        ├── pages/CommunityPage.tsx, MatchingPage.tsx  # 게시판 / 메이트찾기 — 아직 TODO(담당자 B), 실제 데이터 없음
        ├── payment/                   # 장바구니/결제
        ├── profile/                   # 마이페이지 (프로필 수정, 뱃지 목록/대표뱃지 지정)
        ├── records/                   # 나의 기록(여행일지)
        ├── admin/                     # 관리자 페이지
        └── common/                    # 레이아웃, axios client, 공용 컴포넌트(UserBadgeChip 등), 이미지 프록시 헬퍼
```

## ⚠️ 환경변수 설정 (`.env`) — 처음 받으면 꼭 새로 만들어야 함

보안상 `.env`는 git/압축파일에 포함하지 않습니다. `backend/build.gradle`과 같은 위치에 `backend/.env`를 새로 만들고 아래 내용을 채워주세요.

```env
# MySQL/MariaDB 접속 정보 — 실제 로컬 DB 계정에 맞게
DB_USERNAME=dreamuser
DB_PASSWORD=dream1234

# JWT 서명 키 (최소 32자 이상 랜덤 문자열)
JWT_SECRET=change-this-to-a-long-random-secret-key-at-least-32-chars

# 이메일 인증 발송 (Gmail 예시 — 2단계 인증 켠 뒤 "앱 비밀번호" 발급해서 사용, 일반 로그인 비번 아님)
MAIL_USERNAME=your-account@gmail.com
MAIL_PASSWORD=앱비밀번호_공백없이

# 휴대폰 인증 발송 (Solapi)
SOLAPI_API_KEY=
SOLAPI_API_SECRET=
SOLAPI_SENDER=

# 카카오 로그인
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
KAKAO_REDIRECT_URI=http://localhost:3000/oauth/callback/kakao
```

`application.yml`이 이 값들을 `${DB_USERNAME:root}` 형태로 참조합니다. `.env`가 없으면 기본값(`root`/빈 비밀번호 등)으로 떨어져서 DB 연결 자체가 실패하니, **반드시 새로 만들어야** 합니다.

**DB 드라이버 관련 주의**: 로컬 DB가 MariaDB라면 `application.yml`의 `spring.datasource.url`/`driver-class-name`이 `jdbc:mariadb://...` / `org.mariadb.jdbc.Driver`로 되어 있어야 합니다(MySQL 드라이버로 MariaDB에 접속하면 인증 플러그인 충돌이 날 수 있음).

## 도메인별 구현 상태

| 패키지                | 담당 DB 테이블                                                                                                                                       | 현재 상태                       |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `domain/user`         | users, user_oauth_accounts, user_payment_cards, refresh_tokens, login_history                                                                        | ✅ 회원가입/로그인/카카오 로그인/내정보 조회·수정 |
| `domain/verification` | phone_verifications, email_verifications, password_reset_tokens                                                                                      | ✅ 이메일/휴대폰 인증 API        |
| `domain/auth`         | (user 도메인과 연동)                                                                                                                                   | ✅ 인증 Controller (`/api/auth/me` 포함) |
| `domain/badge`        | badge, user_badge, users.level                                                                                                                        | ✅ 뱃지 목록 조회, 대표 뱃지 지정/해제 API |
| `domain/city`         | city                                                                                                                                                  | ✅ 자동완성/인기 여행지 API      |
| `domain/main`         | banner, notice, monthly_destination, main_background                                                                                                  | ✅ 배너/공지/이달의 여행지/배경 API |
| `domain/stats`        | (여러 도메인 집계, 신규 테이블 없음)                                                                                                                    | ✅ 홈 화면 "숫자로 보는 Dream Collection" 집계 API |
| `global/image`        | (없음 — 프록시 전용)                                                                                                                                    | ✅ 외부 이미지(Unsplash) 프록시 — 광고차단 확장 우회용 |
| `domain/admin`        | (여러 도메인 관리자 기능)                                                                                                                              | ✅ 관리자 CRUD API               |
| `domain/trip`         | trip_requests, recommendations, days, days_item, flights, flights_options, accommodations, accommodations_options, trip_payments, trip_payment_items | 🔒 별도 담당자가 진행 중          |
| `domain/travelog`     | travel_log, log_photo, receipt                                                                                                                       | ⬜ Entity/Repository만            |
| `domain/board`        | board_post, board_image, board_like, board_comment, report                                                                                           | 🔒 별도 담당자(B) 예정, 아직 화면/API 없음 |
| `domain/mate`         | mate_post, mate_request, mate_review, mate_schedule_link                                                                                             | 🔒 별도 담당자(B) 예정, 아직 화면/API 없음 |
| `domain/chat`         | chat_room, chat_room_member, chat_message                                                                                                            | ⬜ Entity/Repository만            |
| `domain/social`       | block, notification                                                                                                                                  | ⬜ Entity/Repository만            |

`Controller`/`Service`가 없는 도메인은 아직 Entity/Repository까지만 있는 상태입니다. **각 담당자가 이어서 Service/Controller/DTO를 채우면 됩니다.**

> **게시판/메이트 담당자에게**: `src/common/component/UserBadgeChip.tsx`가 이미 만들어져 있습니다. 게시글 작성자 정보에 `badgeName`/`badgeIconUrl` 필드만 포함시키면(백엔드 응답에 대표 뱃지 정보를 함께 내려주면) 이 컴포넌트를 그대로 갖다 붙여서 작성자 닉네임 옆에 뱃지를 표시할 수 있습니다.

## 주요 API 엔드포인트 (신규/변경분 위주)

| 메서드 | 경로 | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/auth/me`, `/api/users/me` | 내 정보 조회 (새로고침 시 로그인 상태 복구용) | 필요 |
| PATCH | `/api/users/me` | 프로필 수정 (닉네임/프로필이미지/여행스타일, 값 있는 필드만 반영) | 필요 |
| GET | `/api/badges/me` | 내 뱃지 목록 (획득/미획득 전부 + 대표 여부) | 필요 |
| PATCH | `/api/badges/me/representative/{badgeId}` | 대표 뱃지 지정 | 필요 |
| DELETE | `/api/badges/me/representative` | 대표 뱃지 해제 | 필요 |
| GET | `/api/stats` | 홈 화면 통계(등록된 여행 일정/유저/여행일지/지원 국가 수) | 공개 |
| GET | `/api/images/proxy?url=` | 외부 이미지 프록시 (허용 도메인만) | 공개 |

## 로컬 실행 방법

### 백엔드

1. **사전 준비**
   - Java 21 설치 (`temurin-21` 권장)
   - MySQL/MariaDB 실행 중이어야 함
   - `dream_collection` 스키마 및 초기 데이터는 팀에서 공유하는 통합 SQL 스크립트 실행 (테이블 생성 + 시드 데이터, 뱃지/레벨 포함)
   - 위 "환경변수 설정" 항목대로 `backend/.env` 생성

2. **IntelliJ에서 실행**
   1. `backend` 폴더를 프로젝트로 열기
   2. Gradle sync 대기
   3. SDK/Gradle JVM이 21로 잡혀있는지 확인
   4. `BackendApplication.java`의 `main()` 왼쪽 ▶ 버튼으로 실행
   5. 콘솔에 `Tomcat started on port(s): 8080`이 뜨면 성공 (포트는 `application.yml`의 `server.port` 참고)

3. **재실행 시 자주 겪는 문제**
   - `Port XXXX was already in use` → 이전 실행이 안 꺼진 상태. `netstat -ano | findstr :8080` 후 `taskkill /PID <번호> /F`, 또는 IntelliJ Run Configuration에서 "Single instance only" 체크
   - `Unable to load authentication plugin 'auth_gssapi_client'` / `GSS-API authentication exception` → DB 드라이버가 실제 DB(MariaDB/MySQL)와 안 맞음. 위 "DB 드라이버 관련 주의" 참고
   - 이메일/SMS 인증번호가 안 옴 → `.env`의 `MAIL_PASSWORD`(Gmail 앱 비밀번호, 공백 제거)/`SOLAPI_*` 값 확인. Gmail은 가끔 "차단된 로그인 시도" 보안 알림이 뜰 수 있으니 해당 메일에서 본인 확인 필요

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
```
`http://localhost:3000`에서 확인 (Vite 개발서버가 `/api` 요청을 `http://localhost:8080`으로 프록시합니다).

- 이미지가 안 보이면 브라우저 광고차단 확장 프로그램이 외부 이미지(Unsplash)를 막는 경우가 있습니다 → 백엔드의 `/api/images/proxy`를 통해 받아오도록 이미 처리되어 있어서 대부분 해결되지만, 그래도 안 보이면 시크릿 모드로 확인해보세요.

## 알아두면 좋은 것들

- **로그인 상태 복구**: 새로고침해도 로그인이 풀린 것처럼 보이면 `App.tsx`의 `AuthBootstrap`이 `/api/auth/me`를 호출해서 유저 정보를 다시 채워넣습니다. 관련 로직을 건드릴 땐 `authStore.ts`의 `hydrateUser`/`updateUser` 차이를 참고하세요 (`hydrateUser`는 토큰 안 건드리고 user만 갱신, `setUser`는 로그인 성공 시 토큰까지 같이 저장).
- **대표 뱃지**: `user_badge.is_representative`는 유저당 최대 1개만 true여야 합니다 — `BadgeService.setRepresentative()`가 기존 대표를 자동으로 해제하고 새로 지정하니, 이 로직을 우회해서 직접 DB를 만지지 않도록 주의하세요.
- **이미지 프록시**: `/api/images/proxy`는 화이트리스트에 있는 호스트(`images.unsplash.com`)만 대신 요청해줍니다. 다른 이미지 CDN을 추가로 쓰려면 `ImageProxyController.ALLOWED_HOSTS`에 도메인을 추가해야 합니다.

## 설계 원칙

- **FK는 `@ManyToOne` 연관관계 대신 `Long` 필드로 처리**했습니다 (예: `TripRequest.userId`, `UserBadge.userId`). JPA 연관관계는 N+1, 순환참조 등 함정이 많아서 팀 프로젝트 초기엔 단순하게 갑니다. 필요하면 담당자가 나중에 연관관계로 바꿔도 됩니다.
- 모든 Entity는 `@NoArgsConstructor(PROTECTED)` + `@Builder` 조합입니다. `new Entity()`로 무분별하게 만들지 말고, 반드시 `Entity.builder()...build()`로 생성하세요.
- `created_at` 같은 시간 컬럼은 `@CreationTimestamp`(또는 `@PrePersist`)로 자동 채워지므로 직접 값을 넣지 않아도 됩니다.
- API 응답은 전부 `ApiResponse<T>` 형태(`{ success, data, message }`)로 통일합니다. 프론트의 `types/index.ts`의 `ApiResponse<T>`와 구조가 같습니다.
- 프론트엔드 로깅/에러 처리, axios 인터셉터는 `frontend/src/common/api/client.ts`에서 공통으로 관리합니다 (401 시 토큰 재발급 → 실패하면 로그아웃).

## 브랜치 / 커밋 규칙

- 작업 전 `git pull origin <브랜치명>`으로 최신 상태 받고 시작하는 걸 권장합니다.
- 커밋 메시지 예시: `feat(trip): AI 추천 요청 생성 API 추가`, `fix(home): 히어로 배너 슬라이드 인디케이터 위치 수정`
- merge 시 충돌 마커(`<<<<<<<`, `=======`, `>>>>>>>`)가 파일에 남아있지 않은지 커밋 전에 꼭 확인하세요.
