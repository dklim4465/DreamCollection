# Dream Collection

여행 일정 계획 · 동행 매칭 · 여행 기록 커뮤니티 플랫폼입니다.
Spring Boot 백엔드 + React(Vite) 프론트엔드로 구성된 풀스택 프로젝트입니다.

## 기술 스택

**백엔드**
- Java 21
- Spring Boot 3.3 (Web, Data JPA, Validation, Security)
- MySQL 8 / MariaDB 10.11
- JWT (jjwt)
- Gradle (Groovy)
- Lombok

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
│   └── src/main/
│       ├── java/com/dreamcollection/
│       │   ├── DreamCollectionApplication.java   # 메인 실행 클래스
│       │   ├── domain/                # 도메인별 패키지 (아래 표 참고)
│       │   └── global/                # 공통 코드 (security, exception, response)
│       └── resources/
│           └── application.yml        # DB 접속정보, JWT 시크릿 등
│
└── frontend/
    ├── package.json
    └── src/
        ├── App.tsx                    # 라우팅 정의
        ├── auth/                      # 로그인/회원가입/카카오 로그인
        ├── home/                      # 메인페이지 (히어로 배너, 바로가기, 공지사항, 캘린더 등)
        ├── community/                 # 게시판
        ├── matching/                  # 메이트 찾기
        ├── travelPlan/                # 여행 일정
        ├── payment/                   # 장바구니/결제
        ├── profile/                   # 마이페이지
        ├── records/                   # 나의 기록(여행일지)
        ├── admin/                     # 관리자 페이지
        └── common/                    # 레이아웃, axios client, 공용 컴포넌트
```

### 백엔드 도메인 패키지 안 구조 (예시: `domain/user`)

```
domain/user/
├── User.java              # Entity (테이블 매핑)
├── UserRepository.java    # JPA Repository
├── UserService.java       # 비즈니스 로직
├── Role.java, TravelStyle.java, UserStatus.java   # Enum
├── controller/
└── dto/
    ├── SignupRequest.java
    └── UserResponse.java
```

## 도메인별 구현 상태

| 패키지                | 담당 DB 테이블                                                                                                                                       | 현재 상태                       |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `domain/user`         | users, user_oauth_accounts, user_payment_cards, refresh_tokens, login_history                                                                        | ✅ 회원가입/로그인/카카오 로그인 |
| `domain/verification` | phone_verifications, email_verifications, password_reset_tokens                                                                                      | ✅ 이메일/휴대폰 인증 API        |
| `domain/auth`         | (user 도메인과 연동)                                                                                                                                   | ✅ 인증 Controller               |
| `domain/city`         | city                                                                                                                                                  | ✅ 자동완성/인기 여행지 API      |
| `domain/main`         | banner, notice, monthly_destination, main_background                                                                                                  | ✅ 배너/공지/이달의 여행지/배경 API |
| `domain/admin`        | (여러 도메인 관리자 기능)                                                                                                                              | ✅ 관리자 CRUD API               |
| `domain/trip`         | trip_requests, recommendations, days, days_item, flights, flights_options, accommodations, accommodations_options, trip_payments, trip_payment_items | ⬜ Entity/Repository만            |
| `domain/travelog`     | travel_log, log_photo, receipt                                                                                                                       | ⬜ Entity/Repository만            |
| `domain/board`        | board_post, board_image, board_like, board_comment, report                                                                                           | ⬜ Entity/Repository만            |
| `domain/mate`         | mate_post, mate_request, mate_review, mate_schedule_link                                                                                             | ⬜ Entity/Repository만            |
| `domain/chat`         | chat_room, chat_room_member, chat_message                                                                                                            | ⬜ Entity/Repository만            |
| `domain/social`       | block, notification                                                                                                                                  | ⬜ Entity/Repository만            |
| `domain/badge`        | badge, user_badge                                                                                                                                    | ⬜ Entity/Repository만            |

`Controller`/`Service`가 없는 도메인은 아직 Entity/Repository까지만 있는 상태입니다. **각 담당자가 이어서 Service/Controller/DTO를 채우면 됩니다.**

## 프론트엔드 메인페이지 구성 (`home/`)

2026-07 리뉴얼 기준 메인페이지는 아래 순서로 구성되어 있습니다.

1. 진입 시 광고형 배너 팝업 (관리자 등록 배너, "오늘 하루 보지 않기" 지원)
2. 바로가기 5메뉴 — 일정 / 나의기록 / 게시판 / 메이트찾기 / 공지사항(`/notices` 페이지로 이동)
3. 캘린더 + 내 프로필 요약 + 이달의 여행지 BEST 10
4. 화면 전체 폭 히어로 배너
   - 로그인 + 다가오는 일정이 있으면 그 일정의 D-day를 우선 노출
   - 그 외에는 "지금 인기 있는 여행지"(`city`, `is_popular=1`)의 사진과 도시명을 그대로 가져와 5초 간격으로 자동 순환(Ken Burns 확대 효과 포함), 페이지 진입마다 랜덤한 도시부터 시작
5. 지금 인기 있는 여행지 → 이달의 추천 여행지 캐러셀 → 오늘의 환율(실시간 API, 1분마다 자동 갱신) + 공지사항 미리보기 → 서비스 소개

## 로컬 실행 방법

### 백엔드

1. **사전 준비**
   - Java 21 설치 (`temurin-21` 권장)
   - MySQL/MariaDB 실행 중이어야 함
   - `dream_collection` 스키마 및 초기 데이터는 팀에서 공유하는 통합 SQL 스크립트 실행 (테이블 생성 + 시드 데이터)

2. **DB 접속 정보 설정**

   `backend/src/main/resources/application.yml`:
   ```yaml
   spring:
     datasource:
       username: ${DB_USERNAME:root}
       password: ${DB_PASSWORD:}
   ```
   환경변수로 설정하거나 로컬 테스트용으로 직접 값을 넣어도 됩니다. (비밀번호를 직접 넣은 채로 커밋하지 마세요)

3. **IntelliJ에서 실행**
   1. `backend` 폴더를 프로젝트로 열기
   2. Gradle sync 대기
   3. SDK/Gradle JVM이 21로 잡혀있는지 확인
   4. `DreamCollectionApplication.java`의 `main()` 왼쪽 ▶ 버튼으로 실행 (Gradle `test`/`build` 태스크가 아니라 애플리케이션 자체를 실행해야 함)
   5. 콘솔에 `Tomcat started on port(s): 8080`이 뜨면 성공

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
```
`http://localhost:3000`에서 확인 (Vite 개발서버가 `/api` 요청을 `http://localhost:8080`으로 프록시합니다).

## 설계 원칙

- **FK는 `@ManyToOne` 연관관계 대신 `Long` 필드로 처리**했습니다 (예: `TripRequest.userId`). JPA 연관관계는 N+1, 순환참조 등 함정이 많아서 팀 프로젝트 초기엔 단순하게 갑니다. 필요하면 담당자가 나중에 연관관계로 바꿔도 됩니다.
- 모든 Entity는 `@NoArgsConstructor(PROTECTED)` + `@Builder` 조합입니다. `new Entity()`로 무분별하게 만들지 말고, 반드시 `Entity.builder()...build()`로 생성하세요.
- `created_at` 같은 시간 컬럼은 `@CreationTimestamp`(또는 `@PrePersist`)로 자동 채워지므로 직접 값을 넣지 않아도 됩니다.
- API 응답은 전부 `ApiResponse<T>` 형태(`{ success, data, message }`)로 통일합니다. 프론트의 `types/index.ts`의 `ApiResponse<T>`와 구조가 같습니다.
- 프론트엔드 로깅/에러 처리, axios 인터셉터는 `frontend/src/common/api/client.ts`에서 공통으로 관리합니다 (401 시 토큰 재발급 → 실패하면 로그아웃).

## 브랜치 / 커밋 규칙

- 작업 전 `git pull origin <브랜치명>`으로 최신 상태 받고 시작하는 걸 권장합니다.
- 커밋 메시지 예시: `feat(trip): AI 추천 요청 생성 API 추가`, `fix(home): 히어로 배너 슬라이드 인디케이터 위치 수정`
- merge 시 충돌 마커(`<<<<<<<`, `=======`, `>>>>>>>`)가 파일에 남아있지 않은지 커밋 전에 꼭 확인하세요.
