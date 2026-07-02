# Dream Collection — Backend

Spring Boot 3.3 + JPA + MySQL 기반 백엔드입니다.

## 기술 스택

- Java 17
- Spring Boot 3.3 (Web, Data JPA, Validation, Security)
- MySQL 8 / MariaDB 10.11
- JWT (jjwt)
- Gradle (Groovy)
- Lombok

## 폴더 구조

```
backend-clean/
├── build.gradle                  # 의존성 관리
├── settings.gradle
├── src/main/
│   ├── java/com/dreamcollection/
│   │   ├── DreamCollectionApplication.java   # 메인 실행 클래스
│   │   │
│   │   ├── domain/                # 도메인별 패키지 (아래 표 참고)
│   │   │   ├── user/               # 회원, 소셜계정, 카드, 토큰, 로그인이력
│   │   │   ├── verification/       # 이메일/휴대폰 인증, 비밀번호 재설정
│   │   │   ├── auth/               # 회원가입/로그인 API (Controller)
│   │   │   ├── trip/               # 여행 요청~AI추천~항공/숙소~결제
│   │   │   ├── travelog/           # 여행일지, 사진, 영수증
│   │   │   ├── board/              # 게시판, 이미지, 좋아요, 댓글, 신고
│   │   │   ├── mate/                # 메이트 모집/매칭/후기
│   │   │   ├── chat/                # 채팅방, 참여자, 메시지
│   │   │   ├── social/              # 차단, 알림
│   │   │   ├── city/                # 도시 마스터 (자동완성/날씨)
│   │   │   ├── main/                # 배너, 공지, 이달의 여행지, 체크리스트, 배경
│   │   │   └── badge/               # 뱃지, 사용자-뱃지
│   │   │
│   │   └── global/                # 도메인에 속하지 않는 공통 코드
│   │       ├── security/           # JWT, PasswordEncoder 설정
│   │       ├── exception/          # 공통 예외 + 전역 예외 처리기
│   │       └── response/           # 공통 API 응답 포맷 (ApiResponse<T>)
│   │
│   └── resources/
│       └── application.yml         # DB 접속정보, JWT 시크릿 등
│
└── db/                             # DB 스키마(SQL) — 별도 문서 참고
```

### 도메인 패키지 안 구조 (예시: `domain/user`)

각 도메인 패키지는 보통 이렇게 구성됩니다:

```
domain/user/
├── User.java              # Entity (테이블 매핑)
├── UserRepository.java    # JPA Repository
├── UserService.java       # 비즈니스 로직 (아직 없는 도메인도 있음)
├── Role.java, TravelStyle.java, UserStatus.java   # Enum
└── dto/
    ├── SignupRequest.java
    └── UserResponse.java
```

`Controller`는 API가 실제로 필요한 도메인부터 만들어졌고(`user`, `verification`, `auth`), 나머지 도메인은 아직 Entity/Repository까지만 있습니다. **각 담당자가 Service/Controller/DTO를 이어서 채우면 됩니다.**

## 도메인별 담당 테이블

| 패키지                | 담당 DB 테이블                                                                                                                                       | 현재 상태                   |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `domain/user`         | users, user_oauth_accounts, user_payment_cards, refresh_tokens, login_history                                                                        | ✅ 회원가입/로그인 API 완성 |
| `domain/verification` | phone_verifications, email_verifications, password_reset_tokens                                                                                      | ✅ 휴대폰 인증 API 완성     |
| `domain/trip`         | trip_requests, recommendations, days, days_item, flights, flights_options, accommodations, accommodations_options, trip_payments, trip_payment_items | ⬜ Entity만                 |
| `domain/travelog`     | travel_log, log_photo, receipt                                                                                                                       | ⬜ Entity만                 |
| `domain/board`        | board_post, board_image, board_like, board_comment, report                                                                                           | ⬜ Entity만                 |
| `domain/mate`         | mate_post, mate_request, mate_review, mate_schedule_link                                                                                             | ⬜ Entity만                 |
| `domain/chat`         | chat_room, chat_room_member, chat_message                                                                                                            | ⬜ Entity만                 |
| `domain/social`       | block, notification                                                                                                                                  | ⬜ Entity만                 |
| `domain/city`         | city                                                                                                                                                 | ⬜ Entity만                 |
| `domain/main`         | banner, notice, monthly_destination, checklist_item, main_background                                                                                 | ⬜ Entity만                 |
| `domain/badge`        | badge, user_badge                                                                                                                                    | ⬜ Entity만                 |

## 로컬 실행 방법

### 1. 사전 준비

- Java 17 설치 (`temurin-17` 권장)
- MySQL/MariaDB 실행 중이어야 함
- `db/` 폴더의 SQL 파일들을 순서대로 실행해서 `dream_collection` 스키마 생성 (자세한 건 `db/README.md` 참고)

### 2. DB 접속 정보 설정

`src/main/resources/application.yml`에서 아래 값을 본인 환경에 맞게 수정:

```yaml
spring:
  datasource:
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:}
```

환경변수로 설정하거나, 로컬 테스트용으로 직접 값을 넣어도 됩니다. (단, 비밀번호를 직접 넣은 채로 커밋하지 마세요)

### 3. IntelliJ에서 실행

1. `File → Open` → 이 프로젝트 폴더 선택
2. Gradle sync 끝날 때까지 대기
3. `File → Project Structure`에서 SDK가 17로 잡혀있는지 확인
4. `Settings → Build Tools → Gradle`에서 Gradle JVM도 17로 확인
5. `DreamCollectionApplication.java` 실행 → `Tomcat started on port 8080` 뜨면 성공

## 설계 원칙

- **FK는 `@ManyToOne` 연관관계 대신 `Long` 필드로 처리**했습니다 (예: `TripRequest.userId`). JPA 연관관계는 N+1, 순환참조 등 함정이 많아서 팀 프로젝트 초기엔 단순하게 갑니다. 필요하면 담당자가 나중에 연관관계로 바꿔도 됩니다.
- 모든 Entity는 `@NoArgsConstructor(PROTECTED)` + `@Builder` 조합입니다. `new Entity()`로 무분별하게 만들지 말고, 반드시 `Entity.builder()...build()`로 생성하세요.
- `created_at` 같은 시간 컬럼은 `@CreationTimestamp`(또는 `@PrePersist`)로 자동 채워지므로 직접 값을 넣지 않아도 됩니다.
- API 응답은 전부 `ApiResponse<T>` 형태(`{ success, data, message }`)로 통일합니다. 프론트의 `types/index.ts`의 `ApiResponse<T>`와 구조가 같습니다.

## 브랜치 / 커밋 규칙

- 이 프로젝트는 `backend` 브랜치에서 작업합니다. 프론트엔드 파일(`*.tsx`, `package.json`, `vite.config.ts` 등)은 **절대 이 브랜치에 커밋하지 마세요.**
- 작업 전 `git pull origin backend`로 최신 상태 받고 시작하는 걸 권장합니다.
- 담당 도메인 작업 후 커밋 메시지 예시: `feat(trip): AI 추천 요청 생성 API 추가`
