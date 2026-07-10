-- ════════════════════════════════════════════════════════════════
-- Dream Collection — 통합 스키마 + 시드데이터 (1개 파일로 정리)
--
-- 대상 DBMS : MySQL 8.x / MariaDB 10.6+ (InnoDB, utf8mb4)
-- 실행 방법 : 이 파일 하나만 처음부터 끝까지 실행하면 됩니다.
--
-- ⚠ 이번 병합 브랜치 관련 메모 (자동 추가됨)
--  - backend/src/main/resources/application.properties의 spring.datasource.url을
--    이 스키마가 만드는 DB 이름인 dream_collection 으로 맞춰뒀습니다.
--  - 계정은 이 파일에 없으니 아래처럼 직접 만들어주세요:
--      CREATE USER 'traveldbuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'traveldbuser';
--      GRANT ALL PRIVILEGES ON dream_collection.* TO 'traveldbuser'@'localhost';
--      FLUSH PRIVILEGES;
--  - trip(여행요청~AI추천~결제) / board(게시판) / mate(메이트찾기) 테이블은 스키마만
--    포함되어 있고, 이번 병합 브랜치의 백엔드 코드는 아직 사용하지 않습니다
--    (각 담당자가 추후 연결 예정. trip 쪽은 saved_trips 테이블만 실제로 사용 중).
--  - 맨 아래 UPDATE users SET role='ADMIN' 문의 이메일을 본인 계정으로 바꿔서 실행하세요.
-- ════════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS dream_collection
    DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dream_collection;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;


-- ────────────────────────────────────────────────────────────────
-- 1. USERS 도메인 (회원 / 인증 / 소셜로그인 / 결제카드)
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
                                     id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                     uuid                CHAR(36)        NOT NULL DEFAULT (UUID())
    COMMENT '마이페이지 "고유 ID 확인"에서 노출되는 회원 고유 식별자',

    email               VARCHAR(255)    NOT NULL,
    password_hash       VARCHAR(255)    NULL
    COMMENT '소셜 전용 가입자는 NULL 허용 (BCrypt 해시 저장, 평문 절대 저장 금지)',

    name                VARCHAR(50)     NOT NULL COMMENT '실명',
    nickname            VARCHAR(30)     NOT NULL COMMENT '화면에 노출되는 닉네임',
    phone               VARCHAR(20)     NULL,
    phone_verified      TINYINT(1)      NOT NULL DEFAULT 0,
    email_verified      TINYINT(1)      NOT NULL DEFAULT 0,

    profile_image_url   VARCHAR(500)    NULL,
    travel_style        ENUM('RELAXED','ACTIVE','CULTURE','FOOD','ADVENTURE')
    NOT NULL DEFAULT 'RELAXED'
    COMMENT '시작페이지 "내 여행스타일" 표시용',

    level               INT UNSIGNED    NOT NULL DEFAULT 1
    COMMENT '현재 레벨 (계산 기준 미정, 우선 컬럼만 확보)',

    role                ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
    status              ENUM('ACTIVE','SUSPENDED','WITHDRAWN') NOT NULL DEFAULT 'ACTIVE'
    COMMENT '신고 누적 등으로 정지/탈퇴 처리 시 사용',

    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
    withdrawn_at        DATETIME        NULL COMMENT '탈퇴(소프트 삭제) 시각',

    UNIQUE KEY uk_users_email (email),
    UNIQUE KEY uk_users_uuid (uuid),
    UNIQUE KEY uk_users_nickname (nickname)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='회원 기본 정보';

CREATE TABLE IF NOT EXISTS user_payment_cards (
                                                  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                                  user_id         BIGINT UNSIGNED NOT NULL,

                                                  card_company    VARCHAR(30)     NULL COMMENT '예: 신한, 국민 (PG 응답값 그대로 저장)',
    card_last4      CHAR(4)         NULL COMMENT '카드번호 마지막 4자리만 저장 (마스킹 표시용)',
    billing_key     VARCHAR(255)    NOT NULL COMMENT 'PG사 발급 빌링키 (실제 결제는 이 키로 수행)',
    is_default      TINYINT(1)      NOT NULL DEFAULT 1,

    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      DATETIME        NULL,

    KEY idx_cards_user (user_id),
    CONSTRAINT fk_cards_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='회원 등록 결제수단 (빌링키 기반)';

CREATE TABLE IF NOT EXISTS user_oauth_accounts (
                                                   id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                                   user_id             BIGINT UNSIGNED NOT NULL,

                                                   provider            ENUM('GOOGLE','KAKAO','NAVER') NOT NULL,
    provider_user_id    VARCHAR(255)    NOT NULL COMMENT '소셜 서비스가 발급한 고유 사용자 ID',
    access_token        VARCHAR(1000)   NULL,
    refresh_token       VARCHAR(1000)   NULL,
    linked_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_oauth_provider_user (provider, provider_user_id)
    COMMENT '같은 소셜 계정으로 중복 가입 방지',
    KEY idx_oauth_user (user_id),
    CONSTRAINT fk_oauth_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='소셜 로그인 연동 정보';

CREATE TABLE IF NOT EXISTS email_verifications (
                                                   id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                                   email           VARCHAR(255)    NOT NULL,
    code            VARCHAR(10)     NOT NULL COMMENT '6자리 인증번호 등',
    purpose         ENUM('SIGNUP','FIND_PASSWORD') NOT NULL DEFAULT 'SIGNUP',

    expires_at      DATETIME        NOT NULL,
    verified_at     DATETIME        NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    KEY idx_email_verif_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='이메일 인증 코드 발급/검증 이력';

CREATE TABLE IF NOT EXISTS phone_verifications (
                                                   id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                                   phone           VARCHAR(20)     NOT NULL,
    code            VARCHAR(10)     NOT NULL,

    expires_at      DATETIME        NOT NULL,
    verified_at     DATETIME        NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    KEY idx_phone_verif_phone (phone)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='휴대폰 인증 코드 발급/검증 이력';

CREATE TABLE IF NOT EXISTS password_reset_tokens (
                                                     id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                                     user_id         BIGINT UNSIGNED NOT NULL,
                                                     token           CHAR(64)        NOT NULL COMMENT '재설정 링크에 들어가는 1회용 토큰',

    expires_at      DATETIME        NOT NULL,
    used_at         DATETIME        NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_reset_token (token),
    KEY idx_reset_user (user_id),
    CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='비밀번호 재설정 토큰';

CREATE TABLE IF NOT EXISTS refresh_tokens (
                                              id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                              user_id         BIGINT UNSIGNED NOT NULL,
                                              token           VARCHAR(500)    NOT NULL,

    user_agent      VARCHAR(255)    NULL COMMENT '기기/브라우저 식별용 (다중 기기 로그아웃 대비)',
    ip_address      VARCHAR(45)     NULL,

    expires_at      DATETIME        NOT NULL,
    revoked_at      DATETIME        NULL COMMENT '로그아웃/강제 만료 시 기록',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    KEY idx_refresh_user (user_id),
    CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='JWT Refresh Token / 로그인 세션';

CREATE TABLE IF NOT EXISTS login_history (
                                             id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                             user_id         BIGINT UNSIGNED NOT NULL,

                                             login_type      ENUM('EMAIL','GOOGLE','KAKAO','NAVER') NOT NULL,
    ip_address      VARCHAR(45)     NULL,
    user_agent      VARCHAR(255)    NULL,
    success         TINYINT(1)      NOT NULL DEFAULT 1,

    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    KEY idx_login_history_user (user_id),
    CONSTRAINT fk_login_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='로그인 시도 이력';


-- ────────────────────────────────────────────────────────────────
-- 2. CITY (도시 마스터 — 자동완성/날씨/인기여행지 공용)
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS city (
                                    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

                                    name_ko         VARCHAR(100)    NOT NULL COMMENT '도시명 (한글, 예: 도쿄)',
    name_en         VARCHAR(100)    NOT NULL COMMENT '도시명 (영문, 예: Tokyo) — 외부 날씨 API 호출용',
    country_code    VARCHAR(2)      NOT NULL COMMENT 'ISO 3166-1 alpha-2, 예: JP',
    country_name    VARCHAR(50)     NOT NULL COMMENT '국가명 (예: 일본)',

    latitude        DECIMAL(10,7)   NOT NULL,
    longitude       DECIMAL(10,7)   NOT NULL,
    timezone        VARCHAR(50)     NULL COMMENT '예: Asia/Tokyo',

    image_url       VARCHAR(500)    NULL COMMENT '대표 이미지 (메인페이지 배경 등에 재사용)',

    is_popular      TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '자동완성 상단 노출용 인기 도시 플래그',
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,

    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_city_name_ko (name_ko),
    KEY idx_city_popular (is_popular, is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='도시 마스터 (목적지 자동완성/날씨 연동)';


-- ────────────────────────────────────────────────────────────────
-- 3. 메인페이지 콘텐츠 (배너 / 공지사항 / 이달의 여행지 / 배경)
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS banner (
                                      id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                      admin_id        BIGINT UNSIGNED NOT NULL COMMENT '등록한 관리자 (users.role=ADMIN)',
                                      title           VARCHAR(100)    NOT NULL COMMENT '배너 제목 (관리용, 화면 미노출 가능)',
    media_type      ENUM('IMAGE','VIDEO') NOT NULL DEFAULT 'IMAGE' COMMENT '배너 미디어 타입',
    image_url       VARCHAR(500)    NOT NULL COMMENT '배너 이미지/영상 경로',
    link_url        VARCHAR(500)    NULL COMMENT '클릭 시 이동할 URL',
    display_order   INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '노출 순서 (작을수록 먼저)',
    is_active       TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '노출 여부',
    start_at        DATETIME        NULL COMMENT '노출 시작일시 (NULL이면 즉시)',
    end_at          DATETIME        NULL COMMENT '노출 종료일시 (NULL이면 무기한)',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_banner_active_order (is_active, display_order),
    KEY idx_banner_admin (admin_id),
    CONSTRAINT fk_banner_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='메인페이지 배너';

-- 이미 banner 테이블이 있는 상태로 스키마를 먼저 적용해뒀다면(위 CREATE TABLE은 IF NOT EXISTS라 컬럼이 안 생김),
-- 아래 구문을 한 번만 직접 실행해서 media_type 컬럼을 추가해주세요.
-- ALTER TABLE banner ADD COLUMN media_type ENUM('IMAGE','VIDEO') NOT NULL DEFAULT 'IMAGE' COMMENT '배너 미디어 타입' AFTER title;

CREATE TABLE IF NOT EXISTS notice (
                                      id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                      admin_id        BIGINT UNSIGNED NOT NULL COMMENT '작성한 관리자',
                                      title           VARCHAR(150)    NOT NULL,
    content         TEXT            NOT NULL,
    is_pinned       TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '상단 고정 여부',
    is_active       TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '노출 여부',
    view_count      INT UNSIGNED    NOT NULL DEFAULT 0,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_notice_pinned (is_pinned, created_at),
    KEY idx_notice_admin (admin_id),
    CONSTRAINT fk_notice_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='공지사항';

CREATE TABLE IF NOT EXISTS monthly_destination (
                                                   id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                                   admin_id        BIGINT UNSIGNED NOT NULL COMMENT '게시 승인한 관리자',

                                                   display_month   CHAR(7)         NOT NULL COMMENT '노출 연월, 예: 2026-07',
    destination_name VARCHAR(100)   NOT NULL,
    title           VARCHAR(150)    NOT NULL COMMENT '카드에 노출될 제목/캐치프레이즈',
    description     VARCHAR(500)    NULL,
    image_url       VARCHAR(500)    NOT NULL,
    link_url        VARCHAR(500)    NULL COMMENT '클릭 시 이동 경로 (예: 해당 목적지로 일정 생성 유도)',

    source_type     ENUM('MANUAL','AI') NOT NULL DEFAULT 'MANUAL'
    COMMENT '관리자 수동 큐레이션 vs AI 추천 배치 결과',
    display_order   INT UNSIGNED    NOT NULL DEFAULT 0,
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,

    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    KEY idx_monthly_dest_month (display_month, is_active, display_order),
    KEY idx_monthly_dest_admin (admin_id),
    CONSTRAINT fk_monthly_dest_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='이달의 추천 여행지';

CREATE TABLE IF NOT EXISTS main_background (
                                               id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                               admin_id        BIGINT UNSIGNED NOT NULL,

                                               media_type      ENUM('IMAGE','VIDEO') NOT NULL DEFAULT 'IMAGE',
    media_url       VARCHAR(500)    NOT NULL,

    is_active       TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '현재 노출 여부 (동시에 1개만 true 권장, 앱 로직에서 관리)',
    start_at        DATETIME        NULL COMMENT '노출 시작일시 (계절/시즌 연동 시 사용)',
    end_at          DATETIME        NULL COMMENT '노출 종료일시',

    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    KEY idx_main_bg_active (is_active),
    KEY idx_main_bg_admin (admin_id),
    CONSTRAINT fk_main_bg_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='메인페이지 배경 이미지/영상';


-- ────────────────────────────────────────────────────────────────
-- 4. TRIP 도메인 (여행 요청 ~ AI추천 ~ 항공/숙소 ~ 결제)
--    ⚠ 이번 병합 브랜치의 백엔드 코드는 trip 담당자의 작업을 건드리지
--      않기 위해 이 테이블들을 아직 사용하지 않습니다 (saved_trips만 사용).
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS trip_requests (
                                             id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                             user_id         BIGINT UNSIGNED NOT NULL COMMENT '요청한 사용자',

                                             companion_type  VARCHAR(20)     NOT NULL COMMENT '누구랑 가는지(연인/친구/가족/혼자/기타)',
    start_date      DATE            NOT NULL,
    end_date        DATE            NOT NULL,
    destination     VARCHAR(50)     NOT NULL,
    theme           VARCHAR(30)     NULL COMMENT '힐링/맛집/액티비티/쇼핑 등',
    density_level   VARCHAR(10)     NULL COMMENT '여유/보통/빡빡',
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING' COMMENT '요청 처리 상태',

    created_date    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    KEY idx_trip_requests_user (user_id),
    CONSTRAINT fk_trip_requests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='여행 조건 요청 (AI 추천의 시작점)';

CREATE TABLE IF NOT EXISTS recommendations (
                                               id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                               request_id      BIGINT UNSIGNED NOT NULL,

                                               ai_text         TEXT            NULL COMMENT 'AI가 생성한 일정 요약/설명',
                                               display_order   INT UNSIGNED    NOT NULL DEFAULT 0,
                                               is_sel          TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '사용자가 최종 선택한 후보인지',

    created_date    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    KEY idx_reco_request (request_id),
    CONSTRAINT fk_reco_request FOREIGN KEY (request_id) REFERENCES trip_requests(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='AI 추천 결과(일정안) 후보';

CREATE TABLE IF NOT EXISTS days (
                                    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                    recommendation_id   BIGINT UNSIGNED NOT NULL,

                                    day_number         INT UNSIGNED    NOT NULL COMMENT '몇 일차 (1,2,3...)',
                                    day_date           DATE            NOT NULL,

                                    KEY idx_days_reco (recommendation_id),
    CONSTRAINT fk_days_reco FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='추천안의 일자';

CREATE TABLE IF NOT EXISTS days_item (
                                         id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                         day_id          BIGINT UNSIGNED NOT NULL,

                                         visit_order     INT UNSIGNED    NOT NULL COMMENT '하루 중 방문 순서 (order는 예약어라 변경)',
                                         place_name      VARCHAR(100)    NOT NULL,
    category        VARCHAR(20)     NULL,
    description     TEXT            NULL COMMENT 'AI가 생성한 장소 설명/추천 이유',
    lat             DECIMAL(10,7)   NULL,
    lng             DECIMAL(10,7)   NULL,

    KEY idx_days_item_day (day_id),
    CONSTRAINT fk_days_item_day FOREIGN KEY (day_id) REFERENCES days(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='일자별 세부 방문 항목';

CREATE TABLE IF NOT EXISTS flights (
                                       id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

                                       api_provider            VARCHAR(30)     NULL COMMENT '실시간 가격조회 API 제공사',
    graphql_operation_name  VARCHAR(50)     NULL,
    airline                 VARCHAR(50)     NULL,
    departure_code          VARCHAR(10)     NULL,
    arrival_code            VARCHAR(10)     NULL,
    departure_datetime      DATETIME        NULL,
    arrival_datetime        DATETIME        NULL,
    price                   INT UNSIGNED    NULL,
    currency                VARCHAR(10)     NULL,
    seat_class              VARCHAR(20)     NULL,
    booking_deep_link       VARCHAR(255)    NULL,
    api_response_id         VARCHAR(100)    NULL,
    fetched_at              DATETIME        NULL,
    expires_at              DATETIME        NULL COMMENT '캐시 만료 시각'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='항공권 API 캐시';

CREATE TABLE IF NOT EXISTS flights_options (
                                               id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                               recommendation_id   BIGINT UNSIGNED NOT NULL,
                                               flight_id           BIGINT UNSIGNED NULL COMMENT 'API 캐시 참조 (직접입력이면 NULL)',

                                               source_type         VARCHAR(20)     NOT NULL COMMENT 'API/MANUAL 등 옵션 생성 방식',
    enter_airline       VARCHAR(50)     NULL COMMENT '직접입력 - 항공사명',
    enter_schedule      VARCHAR(100)    NULL COMMENT '직접입력 - 출도착 일정 텍스트',
    display_order       INT UNSIGNED    NOT NULL DEFAULT 0,
    is_sel              TINYINT(1)      NOT NULL DEFAULT 0,

    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    KEY idx_flight_opt_reco (recommendation_id),
    KEY idx_flight_opt_flight (flight_id),
    CONSTRAINT fk_flight_opt_reco FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE,
    CONSTRAINT fk_flight_opt_flight FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='추천안에 포함된 항공 옵션';

CREATE TABLE IF NOT EXISTS accommodations (
                                              id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

                                              name                VARCHAR(100)    NOT NULL,
    city                VARCHAR(30)     NULL,
    address             VARCHAR(150)    NULL,
    accommodation_type  VARCHAR(20)     NULL,
    price_per_night     INT UNSIGNED    NULL,
    rating              DECIMAL(2,1)    NULL,
    image_url           VARCHAR(255)    NULL,
    description         TEXT            NULL,
    amenities           VARCHAR(255)    NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='숙소 정보';

CREATE TABLE IF NOT EXISTS accommodations_options (
                                                      id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                                      recommendation_id   BIGINT UNSIGNED NOT NULL,
                                                      accommodation_id    BIGINT UNSIGNED NULL,

                                                      source_type         VARCHAR(20)     NOT NULL,
    enter_name          VARCHAR(100)    NULL COMMENT '직접입력 - 숙소명',
    enter_address       VARCHAR(150)    NULL COMMENT '직접입력 - 주소',
    nights              INT UNSIGNED    NULL,
    display_order       INT UNSIGNED    NOT NULL DEFAULT 0,
    is_sel              TINYINT(1)      NOT NULL DEFAULT 0,

    created_date        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    KEY idx_acc_opt_reco (recommendation_id),
    KEY idx_acc_opt_acc (accommodation_id),
    CONSTRAINT fk_acc_opt_reco FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE,
    CONSTRAINT fk_acc_opt_acc FOREIGN KEY (accommodation_id) REFERENCES accommodations(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='추천안에 포함된 숙소 옵션';

CREATE TABLE IF NOT EXISTS trip_payments (
                                             id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                             request_id              BIGINT UNSIGNED NOT NULL COMMENT '결제 대상 여행 요청',

                                             payment_status          VARCHAR(20)     NOT NULL DEFAULT 'READY',
    partner_order_id        VARCHAR(100)    NULL COMMENT '가맹점(우리 서비스) 주문번호',
    partner_user_id         VARCHAR(100)    NULL COMMENT '가맹점 회원 ID',
    imp_uid                 VARCHAR(100)    NULL COMMENT 'PortOne 고유 아이디',
    tid                     VARCHAR(100)    NULL COMMENT '카카오페이 결제 고유번호',
    aid                     VARCHAR(100)    NULL COMMENT '카카오페이 결제 승인번호',
    next_redirect_pc_url    VARCHAR(255)    NULL,
    approved_at             DATETIME        NULL,
    canceled_at             DATETIME        NULL,
    fail_reason             VARCHAR(255)    NULL,

    created_date            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    KEY idx_trip_payments_request (request_id),
    CONSTRAINT fk_trip_payments_request FOREIGN KEY (request_id) REFERENCES trip_requests(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='결제 (PortOne/카카오페이)';

CREATE TABLE IF NOT EXISTS trip_payment_items (
                                                  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                                  payment_id          BIGINT UNSIGNED NOT NULL,

                                                  item_type           VARCHAR(20)     NOT NULL COMMENT 'FLIGHT/ACCOMMODATION 등 항목 구분',
    flight_option_id    BIGINT UNSIGNED NULL,
    acc_option_id       BIGINT UNSIGNED NULL,
    amount              INT UNSIGNED    NOT NULL,
    description         VARCHAR(150)    NULL,

    KEY idx_pay_item_payment (payment_id),
    CONSTRAINT fk_pay_item_payment FOREIGN KEY (payment_id) REFERENCES trip_payments(id) ON DELETE CASCADE,
    CONSTRAINT fk_pay_item_flight_opt FOREIGN KEY (flight_option_id) REFERENCES flights_options(id) ON DELETE SET NULL,
    CONSTRAINT fk_pay_item_acc_opt FOREIGN KEY (acc_option_id) REFERENCES accommodations_options(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='결제 상세 항목';

-- AI 추천 배낭여행 저장분 (TripAiClient 모듈에서 사용 — 현재 병합 브랜치에서 실제로 쓰는 유일한 trip 테이블)
CREATE TABLE IF NOT EXISTS saved_trips (
                                           id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                           user_id                 BIGINT UNSIGNED NOT NULL,
                                           conditions_json         TEXT,
                                           recommendation_json     LONGTEXT NOT NULL,
                                           created_date            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                           KEY idx_saved_trips_user (user_id),
    CONSTRAINT fk_saved_trips_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='AI 추천 여행 저장 이력';


-- ────────────────────────────────────────────────────────────────
-- 5. 여행일지 (TRAVEL_LOG / LOG_PHOTO / RECEIPT)
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS travel_log (
                                          id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                          user_id         BIGINT UNSIGNED NOT NULL,
                                          request_id      BIGINT UNSIGNED NULL COMMENT '연관 여행 요청 (선택)',

                                          title           VARCHAR(100)    NOT NULL,
    memo            TEXT            NULL,

    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    KEY idx_travel_log_user (user_id),
    KEY idx_travel_log_request (request_id),
    CONSTRAINT fk_travel_log_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_travel_log_request FOREIGN KEY (request_id) REFERENCES trip_requests(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='여행일지';

CREATE TABLE IF NOT EXISTS log_photo (
                                         id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                         log_id          BIGINT UNSIGNED NOT NULL,

                                         image_url       VARCHAR(255)    NOT NULL,
    latitude        DECIMAL(10,7)   NULL,
    longitude       DECIMAL(10,7)   NULL,
    taken_at        DATETIME        NULL,

    KEY idx_log_photo_log (log_id),
    CONSTRAINT fk_log_photo_log FOREIGN KEY (log_id) REFERENCES travel_log(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='여행일지 사진';

CREATE TABLE IF NOT EXISTS receipt (
                                       id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                       log_id          BIGINT UNSIGNED NOT NULL,

                                       image_url       VARCHAR(255)    NOT NULL,
    store_name      VARCHAR(100)    NULL,
    amount          DECIMAL(10,2)   NULL,
    purchased_at    DATETIME        NULL,

    KEY idx_receipt_log (log_id),
    CONSTRAINT fk_receipt_log FOREIGN KEY (log_id) REFERENCES travel_log(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='영수증 (OCR 인식)';


-- ────────────────────────────────────────────────────────────────
-- 6. 게시판 (BOARD_POST / IMAGE / LIKE / COMMENT / REPORT)
--    ⚠ 이번 병합 브랜치에서는 게시판 기능 자체를 제외했습니다.
--      스키마만 미리 만들어둬도 무방합니다.
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS board_post (
                                          id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                          user_id         BIGINT UNSIGNED NOT NULL,

                                          category        VARCHAR(20)     NOT NULL COMMENT '예약양도/자유/후기',
    title           VARCHAR(150)    NOT NULL,
    content         TEXT            NOT NULL,
    price           DECIMAL(10,2)   NULL COMMENT '양도가 (예약양도 전용)',
    view_count      INT UNSIGNED    NOT NULL DEFAULT 0,
    like_count      INT UNSIGNED    NOT NULL DEFAULT 0,
    trade_status    VARCHAR(20)     NULL COMMENT '거래상태(거래중/거래완료/취소, 예약양도 전용)',

    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    KEY idx_board_post_user (user_id),
    KEY idx_board_post_category (category),
    CONSTRAINT fk_board_post_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='게시글';

CREATE TABLE IF NOT EXISTS board_image (
                                           id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                           post_id         BIGINT UNSIGNED NOT NULL,

                                           image_url       VARCHAR(255)    NOT NULL,
    order_no        INT UNSIGNED    NOT NULL DEFAULT 0,

    KEY idx_board_image_post (post_id),
    CONSTRAINT fk_board_image_post FOREIGN KEY (post_id) REFERENCES board_post(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='게시글 이미지';

CREATE TABLE IF NOT EXISTS board_like (
                                          id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                          post_id         BIGINT UNSIGNED NOT NULL,
                                          user_id         BIGINT UNSIGNED NOT NULL,

                                          created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                          UNIQUE KEY uk_board_like (post_id, user_id) COMMENT '중복 좋아요 방지',
    KEY idx_board_like_user (user_id),
    CONSTRAINT fk_board_like_post FOREIGN KEY (post_id) REFERENCES board_post(id) ON DELETE CASCADE,
    CONSTRAINT fk_board_like_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='게시글 좋아요';

CREATE TABLE IF NOT EXISTS board_comment (
                                             id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                             post_id             BIGINT UNSIGNED NOT NULL,
                                             user_id             BIGINT UNSIGNED NOT NULL,
                                             parent_comment_id   BIGINT UNSIGNED NULL COMMENT '답글 대상 댓글 (NULL=최상위 댓글)',

                                             content             VARCHAR(500)    NOT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    KEY idx_board_comment_post (post_id),
    KEY idx_board_comment_user (user_id),
    KEY idx_board_comment_parent (parent_comment_id),
    CONSTRAINT fk_board_comment_post FOREIGN KEY (post_id) REFERENCES board_post(id) ON DELETE CASCADE,
    CONSTRAINT fk_board_comment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_board_comment_parent FOREIGN KEY (parent_comment_id) REFERENCES board_comment(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='게시글 댓글 (대댓글 지원)';

CREATE TABLE IF NOT EXISTS report (
                                      id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                      reporter_id     BIGINT UNSIGNED NOT NULL,

                                      target_type     VARCHAR(20)     NOT NULL COMMENT 'POST/COMMENT/USER',
    target_id       BIGINT UNSIGNED NOT NULL,
    reason          VARCHAR(255)    NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING',

    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    KEY idx_report_reporter (reporter_id),
    KEY idx_report_target (target_type, target_id),
    CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='신고';


-- ────────────────────────────────────────────────────────────────
-- 7. 메이트 (MATE_POST / REQUEST / REVIEW / SCHEDULE_LINK)
--    ⚠ 이번 병합 브랜치에서는 메이트찾기 기능 자체를 제외했습니다.
--      스키마만 미리 만들어둬도 무방합니다.
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS mate_post (
                                         id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                         user_id         BIGINT UNSIGNED NOT NULL,
                                         city_id         BIGINT UNSIGNED NULL COMMENT '선택된 도시 (자동완성)',

                                         destination     VARCHAR(100)    NOT NULL,
    start_date      DATE            NOT NULL,
    end_date        DATE            NOT NULL,
    content         TEXT            NOT NULL,
    preferred_age   VARCHAR(20)     NULL,
    preferred_gender VARCHAR(10)    NULL,
    travel_style    VARCHAR(50)     NULL,
    recruit_count   INT UNSIGNED    NOT NULL DEFAULT 1 COMMENT '모집 정원',
    status          VARCHAR(20)     NOT NULL DEFAULT 'RECRUITING' COMMENT '모집중/모집완료/여행종료',

    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    KEY idx_mate_post_user (user_id),
    KEY idx_mate_post_city (city_id),
    CONSTRAINT fk_mate_post_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_mate_post_city FOREIGN KEY (city_id) REFERENCES city(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='메이트 모집글';

CREATE TABLE IF NOT EXISTS mate_request (
                                            id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                            mate_post_id    BIGINT UNSIGNED NOT NULL,
                                            requester_id    BIGINT UNSIGNED NOT NULL,

                                            status          VARCHAR(20)     NOT NULL DEFAULT 'REQUESTED',

    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_mate_request (mate_post_id, requester_id),
    KEY idx_mate_request_requester (requester_id),
    CONSTRAINT fk_mate_request_post FOREIGN KEY (mate_post_id) REFERENCES mate_post(id) ON DELETE CASCADE,
    CONSTRAINT fk_mate_request_requester FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='메이트 매칭 요청';

CREATE TABLE IF NOT EXISTS mate_review (
                                           id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                           mate_post_id    BIGINT UNSIGNED NOT NULL,
                                           reviewer_id     BIGINT UNSIGNED NOT NULL,
                                           reviewee_id     BIGINT UNSIGNED NOT NULL,

                                           rating          TINYINT UNSIGNED NOT NULL COMMENT '1~5',
                                           content         VARCHAR(500)    NULL,

    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    KEY idx_mate_review_post (mate_post_id),
    KEY idx_mate_review_reviewee (reviewee_id),
    CONSTRAINT fk_mate_review_post FOREIGN KEY (mate_post_id) REFERENCES mate_post(id) ON DELETE CASCADE,
    CONSTRAINT fk_mate_review_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_mate_review_reviewee FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_mate_review_rating CHECK (rating BETWEEN 1 AND 5)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='메이트 후기';

CREATE TABLE IF NOT EXISTS mate_schedule_link (
                                                  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                                  mate_post_id    BIGINT UNSIGNED NOT NULL,
                                                  request_id      BIGINT UNSIGNED NOT NULL COMMENT '공유되는 여행 요청 (구 schedule_id)',

                                                  linked_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                                  KEY idx_mate_link_post (mate_post_id),
    KEY idx_mate_link_request (request_id),
    CONSTRAINT fk_mate_link_post FOREIGN KEY (mate_post_id) REFERENCES mate_post(id) ON DELETE CASCADE,
    CONSTRAINT fk_mate_link_request FOREIGN KEY (request_id) REFERENCES trip_requests(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='메이트 모집글 - 개인 일정 공유 연결';

-- 여행 요청(trip_requests)에 종속되는 체크리스트 (main.checklist_item — 현재 병합 브랜치의
-- ChecklistItem 엔티티가 실제로 사용하는 테이블. request_id는 JPA 연관관계가 아닌 Long 컬럼이라
-- trip_requests가 비어있어도 앱 실행/컴파일에는 문제 없습니다)
CREATE TABLE IF NOT EXISTS checklist_item (
                                              id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                              request_id      BIGINT UNSIGNED NOT NULL,

                                              content         VARCHAR(150)    NOT NULL COMMENT '예: 여권 유효기간 확인, 로밍/유심 준비',
    category        VARCHAR(30)     NULL COMMENT '예: 서류/짐/예약/기타 (필터/그룹핑용)',
    is_checked      TINYINT(1)      NOT NULL DEFAULT 0,
    display_order   INT UNSIGNED    NOT NULL DEFAULT 0,

    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    checked_at      DATETIME        NULL COMMENT '체크 완료 시각',

    KEY idx_checklist_request (request_id, display_order),
    CONSTRAINT fk_checklist_request FOREIGN KEY (request_id) REFERENCES trip_requests(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='여행자 준비 체크리스트 (일정별)';


-- ────────────────────────────────────────────────────────────────
-- 8. 채팅 (CHAT_ROOM / MEMBER / MESSAGE)
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS chat_room (
                                         id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                         mate_post_id    BIGINT UNSIGNED NOT NULL,

                                         created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                         KEY idx_chat_room_mate_post (mate_post_id),
    CONSTRAINT fk_chat_room_mate_post FOREIGN KEY (mate_post_id) REFERENCES mate_post(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='채팅방';

CREATE TABLE IF NOT EXISTS chat_room_member (
                                                id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                                room_id         BIGINT UNSIGNED NOT NULL,
                                                user_id         BIGINT UNSIGNED NOT NULL,

                                                last_read_at    DATETIME        NULL,
                                                joined_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                                UNIQUE KEY uk_chat_room_member (room_id, user_id),
    KEY idx_chat_room_member_user (user_id),
    CONSTRAINT fk_chat_room_member_room FOREIGN KEY (room_id) REFERENCES chat_room(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_room_member_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='채팅방 참여자 (안읽은 메시지 계산용 last_read_at 포함)';

CREATE TABLE IF NOT EXISTS chat_message (
                                            id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                            room_id         BIGINT UNSIGNED NOT NULL,
                                            sender_id       BIGINT UNSIGNED NOT NULL,

                                            content         VARCHAR(1000)   NOT NULL COMMENT '메시지 내용 (이미지면 URL)',
    message_type    VARCHAR(10)     NOT NULL DEFAULT 'TEXT' COMMENT 'TEXT/IMAGE/SYSTEM',
    sent_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    KEY idx_chat_message_room (room_id),
    KEY idx_chat_message_sender (sender_id),
    CONSTRAINT fk_chat_message_room FOREIGN KEY (room_id) REFERENCES chat_room(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_message_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='채팅 메시지';


-- ────────────────────────────────────────────────────────────────
-- 9. 차단 / 알림
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `block` (
                                       id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                       user_id             BIGINT UNSIGNED NOT NULL,
                                       blocked_user_id     BIGINT UNSIGNED NOT NULL,

                                       created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                       UNIQUE KEY uk_block_pair (user_id, blocked_user_id),
    KEY idx_block_blocked_user (blocked_user_id),
    CONSTRAINT fk_block_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_block_blocked_user FOREIGN KEY (blocked_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_block_not_self CHECK (user_id <> blocked_user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='사용자 차단';

CREATE TABLE IF NOT EXISTS notification (
                                            id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                            user_id         BIGINT UNSIGNED NOT NULL,

                                            type            VARCHAR(30)     NOT NULL COMMENT '댓글/좋아요/매칭요청/채팅 등',
    target_type     VARCHAR(20)     NULL COMMENT '클릭 시 이동 대상 타입(POST/COMMENT/CHAT_ROOM/MATE_REQUEST)',
    target_id       BIGINT UNSIGNED NULL COMMENT '클릭 시 이동 대상 ID',
    content         VARCHAR(255)    NOT NULL,
    is_read         TINYINT(1)      NOT NULL DEFAULT 0,

    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    KEY idx_notification_user (user_id),
    KEY idx_notification_user_read (user_id, is_read)
    -- target_type에 따라 대상 테이블이 달라지는 폴리모픽 구조라 FK는 걸지 않음
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='알림';


-- ────────────────────────────────────────────────────────────────
-- 10. 레벨 / 뱃지
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS badge (
                                     id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

                                     code                VARCHAR(50)     NOT NULL COMMENT '내부 식별 코드, 예: FIRST_PAYMENT',
    name                VARCHAR(50)     NOT NULL COMMENT '뱃지 이름, 예: 첫 결제 완료',
    description         VARCHAR(255)    NOT NULL,
    icon_url            VARCHAR(500)    NOT NULL,

    condition_type      ENUM('PAYMENT_COUNT','TRIP_COUNT','REVIEW_COUNT','LOG_COUNT','COUNTRY_COUNT','COUNTRY_VISIT','LEVEL_REACHED','MANUAL')
    NOT NULL COMMENT '자동 지급 조건 종류 (MANUAL=관리자 수동 지급)',
    condition_value     INT UNSIGNED    NULL COMMENT '조건 달성 기준치 (예: PAYMENT_COUNT=1 → 결제 1회, LEVEL_REACHED=5 → 레벨 5 달성)',
    condition_country_code VARCHAR(2)   NULL COMMENT 'condition_type=COUNTRY_VISIT일 때 대상 국가 코드 (city.country_code와 매칭, 도감용)',

    is_active           TINYINT(1)      NOT NULL DEFAULT 1,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_badge_code (code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='뱃지 마스터';

CREATE TABLE IF NOT EXISTS user_badge (
                                          id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                          user_id         BIGINT UNSIGNED NOT NULL,
                                          badge_id        BIGINT UNSIGNED NOT NULL,

                                          earned_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                          is_representative TINYINT(1)    NOT NULL DEFAULT 0
    COMMENT '닉네임 옆에 대표로 노출할 뱃지 (사용자가 선택, 1개 권장)',

    UNIQUE KEY uk_user_badge (user_id, badge_id) COMMENT '동일 뱃지 중복 획득 방지',
    KEY idx_user_badge_badge (badge_id),
    CONSTRAINT fk_user_badge_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_badge_badge FOREIGN KEY (badge_id) REFERENCES badge(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='사용자 획득 뱃지';


SET FOREIGN_KEY_CHECKS = 1;


-- ════════════════════════════════════════════════════════════════
-- 11. 시드 데이터
--     "이미 있으면 건너뛰기" 방식이라 이 파일을 다시 실행해도
--     안전합니다 (중복으로 쌓이지 않음).
--     admin_id = 1 은 users 테이블의 관리자 계정 id로 맞춰뒀습니다.
--     다르면 아래 값들을 본인의 실제 admin user id로 바꿔주세요.
-- ════════════════════════════════════════════════════════════════

-- 11-1) 인기 여행지 (city, is_popular=1)
INSERT INTO city (name_ko, name_en, country_code, country_name, latitude, longitude, timezone, image_url, is_popular)
SELECT * FROM (SELECT '도쿄' AS name_ko,'Tokyo' AS name_en,'JP' AS country_code,'일본' AS country_name,35.6762000 AS latitude,139.6503000 AS longitude,'Asia/Tokyo' AS timezone,'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400' AS image_url,1 AS is_popular) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM city WHERE name_ko = '도쿄');

INSERT INTO city (name_ko, name_en, country_code, country_name, latitude, longitude, timezone, image_url, is_popular)
SELECT * FROM (SELECT '오사카' AS name_ko,'Osaka' AS name_en,'JP' AS country_code,'일본' AS country_name,34.6937000 AS latitude,135.5023000 AS longitude,'Asia/Tokyo' AS timezone,'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=400' AS image_url,1 AS is_popular) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM city WHERE name_ko = '오사카');

INSERT INTO city (name_ko, name_en, country_code, country_name, latitude, longitude, timezone, image_url, is_popular)
SELECT * FROM (SELECT '후쿠오카' AS name_ko,'Fukuoka' AS name_en,'JP' AS country_code,'일본' AS country_name,33.5904000 AS latitude,130.4017000 AS longitude,'Asia/Tokyo' AS timezone,'https://images.unsplash.com/photo-1533050487297-09b450131914?auto=format&fit=crop&w=400' AS image_url,1 AS is_popular) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM city WHERE name_ko = '후쿠오카');

INSERT INTO city (name_ko, name_en, country_code, country_name, latitude, longitude, timezone, image_url, is_popular)
SELECT * FROM (SELECT '방콕' AS name_ko,'Bangkok' AS name_en,'TH' AS country_code,'태국' AS country_name,13.7563000 AS latitude,100.5018000 AS longitude,'Asia/Bangkok' AS timezone,'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=400' AS image_url,1 AS is_popular) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM city WHERE name_ko = '방콕');

INSERT INTO city (name_ko, name_en, country_code, country_name, latitude, longitude, timezone, image_url, is_popular)
SELECT * FROM (SELECT '다낭' AS name_ko,'Da Nang' AS name_en,'VN' AS country_code,'베트남' AS country_name,16.0544000 AS latitude,108.2022000 AS longitude,'Asia/Ho_Chi_Minh' AS timezone,'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=400' AS image_url,1 AS is_popular) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM city WHERE name_ko = '다낭');

INSERT INTO city (name_ko, name_en, country_code, country_name, latitude, longitude, timezone, image_url, is_popular)
SELECT * FROM (SELECT '파리' AS name_ko,'Paris' AS name_en,'FR' AS country_code,'프랑스' AS country_name,48.8566000 AS latitude,2.3522000 AS longitude,'Europe/Paris' AS timezone,'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400' AS image_url,1 AS is_popular) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM city WHERE name_ko = '파리');

INSERT INTO city (name_ko, name_en, country_code, country_name, latitude, longitude, timezone, image_url, is_popular)
SELECT * FROM (SELECT '제주' AS name_ko,'Jeju' AS name_en,'KR' AS country_code,'대한민국' AS country_name,33.4996000 AS latitude,126.5312000 AS longitude,'Asia/Seoul' AS timezone,'https://images.pexels.com/photos/30966636/pexels-photo-30966636.jpeg?auto=compress&cs=tinysrgb&w=400' AS image_url,1 AS is_popular) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM city WHERE name_ko = '제주');

INSERT INTO city (name_ko, name_en, country_code, country_name, latitude, longitude, timezone, image_url, is_popular)
SELECT * FROM (SELECT '뉴욕' AS name_ko,'New York' AS name_en,'US' AS country_code,'미국' AS country_name,40.7128000 AS latitude,-74.0060000 AS longitude,'America/New_York' AS timezone,'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400' AS image_url,1 AS is_popular) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM city WHERE name_ko = '뉴욕');

-- 11-2) 메인 배너
INSERT INTO banner (admin_id, title, media_type, image_url, link_url, display_order, is_active)
SELECT * FROM (SELECT 1 AS admin_id,'여름 특가 이벤트' AS title,'IMAGE' AS media_type,'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' AS image_url,'https://example.com' AS link_url,1 AS display_order,1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM banner WHERE title = '여름 특가 이벤트');

-- 이미 위 행이 만들어져 있던 경우(과거 스키마 적용분) 순서만 2번으로 밀어서 새 영상 배너가 먼저 보이게 함
UPDATE banner SET display_order = 1 WHERE title = '여름 특가 이벤트' AND display_order = 0;

INSERT INTO banner (admin_id, title, media_type, image_url, link_url, display_order, is_active)
SELECT * FROM (SELECT 1 AS admin_id,'대표 홍보 영상' AS title,'VIDEO' AS media_type,'http://localhost:8080/uploads/videos/main-banner.mp4' AS image_url,NULL AS link_url,0 AS display_order,1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM banner WHERE title = '대표 홍보 영상');

-- 11-3) 이달의 여행지 (display_month는 반드시 'YYYY-MM' 형식 — 매달 갱신 필요)
INSERT INTO monthly_destination (admin_id, display_month, destination_name, title, description, image_url, link_url, source_type, display_order, is_active)
SELECT * FROM (SELECT 1 AS admin_id,'2026-07' AS display_month,'오사카' AS destination_name,'여름 오사카, 미식 여행 어때요?' AS title,'도톤보리 야경과 다코야키 골목 투어' AS description,'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=800' AS image_url,NULL AS link_url,'MANUAL' AS source_type,1 AS display_order,1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM monthly_destination WHERE display_month = '2026-07' AND destination_name = '오사카');

INSERT INTO monthly_destination (admin_id, display_month, destination_name, title, description, image_url, link_url, source_type, display_order, is_active)
SELECT * FROM (SELECT 1 AS admin_id,'2026-07' AS display_month,'다낭' AS destination_name,'여름 휴가는 다낭에서 힐링' AS title,'바나힐과 미케비치, 가성비 최고 휴양지' AS description,'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800' AS image_url,NULL AS link_url,'MANUAL' AS source_type,2 AS display_order,1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM monthly_destination WHERE display_month = '2026-07' AND destination_name = '다낭');

INSERT INTO monthly_destination (admin_id, display_month, destination_name, title, description, image_url, link_url, source_type, display_order, is_active)
SELECT * FROM (SELECT 1 AS admin_id,'2026-07' AS display_month,'방콕' AS destination_name,'방콕에서 즐기는 야시장 투어' AS title,'왓 아룬 사원과 짜뚜짝 시장 여행' AS description,'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800' AS image_url,NULL AS link_url,'MANUAL' AS source_type,3 AS display_order,1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM monthly_destination WHERE display_month = '2026-07' AND destination_name = '방콕');

INSERT INTO monthly_destination (admin_id, display_month, destination_name, title, description, image_url, link_url, source_type, display_order, is_active)
SELECT * FROM (SELECT 1 AS admin_id,'2026-07' AS display_month,'제주도' AS destination_name,'가까운 여름 제주, 바다 여행' AS title,'협재해변과 성산일출봉 당일치기 코스' AS description,'https://images.pexels.com/photos/30966636/pexels-photo-30966636.jpeg?auto=compress&cs=tinysrgb&w=800' AS image_url,NULL AS link_url,'MANUAL' AS source_type,4 AS display_order,1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM monthly_destination WHERE display_month = '2026-07' AND destination_name = '제주도');

INSERT INTO monthly_destination (admin_id, display_month, destination_name, title, description, image_url, link_url, source_type, display_order, is_active)
SELECT * FROM (SELECT 1 AS admin_id,'2026-07' AS display_month,'도쿄' AS destination_name,'도쿄, 여름 불꽃축제 여행' AS title,'스미다가와 불꽃축제와 시부야 쇼핑 투어' AS description,'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800' AS image_url,NULL AS link_url,'MANUAL' AS source_type,5 AS display_order,1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM monthly_destination WHERE display_month = '2026-07' AND destination_name = '도쿄');

INSERT INTO monthly_destination (admin_id, display_month, destination_name, title, description, image_url, link_url, source_type, display_order, is_active)
SELECT * FROM (SELECT 1 AS admin_id,'2026-07' AS display_month,'파리' AS destination_name,'파리, 낭만 가득한 여름 산책' AS title,'에펠탑 야경과 세느강 유람선 투어' AS description,'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800' AS image_url,NULL AS link_url,'MANUAL' AS source_type,6 AS display_order,1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM monthly_destination WHERE display_month = '2026-07' AND destination_name = '파리');

INSERT INTO monthly_destination (admin_id, display_month, destination_name, title, description, image_url, link_url, source_type, display_order, is_active)
SELECT * FROM (SELECT 1 AS admin_id,'2026-07' AS display_month,'후쿠오카' AS destination_name,'후쿠오카, 여름 온천과 맛집 여행' AS title,'유후인 온천과 하카타 라멘 골목 투어' AS description,'https://images.unsplash.com/photo-1533050487297-09b450131914?auto=format&fit=crop&w=800' AS image_url,NULL AS link_url,'MANUAL' AS source_type,7 AS display_order,1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM monthly_destination WHERE display_month = '2026-07' AND destination_name = '후쿠오카');

INSERT INTO monthly_destination (admin_id, display_month, destination_name, title, description, image_url, link_url, source_type, display_order, is_active)
SELECT * FROM (SELECT 1 AS admin_id,'2026-07' AS display_month,'뉴욕' AS destination_name,'뉴욕, 여름 브로드웨이 여행' AS title,'센트럴파크 피크닉과 브로드웨이 뮤지컬 관람' AS description,'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800' AS image_url,NULL AS link_url,'MANUAL' AS source_type,8 AS display_order,1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM monthly_destination WHERE display_month = '2026-07' AND destination_name = '뉴욕');

INSERT INTO monthly_destination (admin_id, display_month, destination_name, title, description, image_url, link_url, source_type, display_order, is_active)
SELECT * FROM (SELECT 1 AS admin_id,'2026-07' AS display_month,'세부' AS destination_name,'세부, 여름 스노클링 휴양' AS title,'오슬롭 고래상어 투어와 아일랜드 호핑' AS description,'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800' AS image_url,NULL AS link_url,'MANUAL' AS source_type,9 AS display_order,1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM monthly_destination WHERE display_month = '2026-07' AND destination_name = '세부');

INSERT INTO monthly_destination (admin_id, display_month, destination_name, title, description, image_url, link_url, source_type, display_order, is_active)
SELECT * FROM (SELECT 1 AS admin_id,'2026-07' AS display_month,'싱가포르' AS destination_name,'싱가포르, 여름 도심 야경 여행' AS title,'마리나베이샌즈 야경과 가든스바이더베이 투어' AS description,'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800' AS image_url,NULL AS link_url,'MANUAL' AS source_type,10 AS display_order,1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM monthly_destination WHERE display_month = '2026-07' AND destination_name = '싱가포르');

-- 11-4) 공지사항
INSERT INTO notice (admin_id, title, content, is_pinned, is_active, view_count)
SELECT * FROM (SELECT 1 AS admin_id,'여름 휴가 이벤트 안내' AS title,'7월 한 달간 항공권 예약 시 최대 10% 할인 쿠폰을 드립니다. 마이페이지에서 쿠폰함을 확인해주세요!' AS content,1 AS is_pinned,1 AS is_active,0 AS view_count) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM notice WHERE title = '여름 휴가 이벤트 안내');

INSERT INTO notice (admin_id, title, content, is_pinned, is_active, view_count)
SELECT * FROM (SELECT 1 AS admin_id,'서비스 점검 안내 (7/10 새벽)' AS title,'더 나은 서비스 제공을 위해 7월 10일 새벽 2시~4시 사이 일시적으로 서비스 접속이 제한될 수 있습니다.' AS content,0 AS is_pinned,1 AS is_active,0 AS view_count) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM notice WHERE title = '서비스 점검 안내 (7/10 새벽)');

INSERT INTO notice (admin_id, title, content, is_pinned, is_active, view_count)
SELECT * FROM (SELECT 1 AS admin_id,'Traveler''s Hub 이용 가이드' AS title,'일정 등록부터 동행 찾기까지, 처음 오신 분들을 위한 이용 가이드를 준비했습니다.' AS content,0 AS is_pinned,1 AS is_active,0 AS view_count) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM notice WHERE title = 'Traveler''s Hub 이용 가이드');

INSERT INTO notice (admin_id, title, content, is_pinned, is_active, view_count)
SELECT * FROM (SELECT 1 AS admin_id,'개인정보 처리방침 개정 안내' AS title,'2026년 8월 1일부터 적용되는 개정된 개인정보 처리방침을 안내드립니다. 자세한 내용은 고객센터를 확인해주세요.' AS content,0 AS is_pinned,1 AS is_active,0 AS view_count) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM notice WHERE title = '개인정보 처리방침 개정 안내');

INSERT INTO notice (admin_id, title, content, is_pinned, is_active, view_count)
SELECT * FROM (SELECT 1 AS admin_id,'추석 연휴 고객센터 운영 안내' AS title,'추석 연휴 기간 동안 고객센터 운영시간이 단축됩니다. 긴급 문의는 카카오톡 채널로 남겨주시면 순차적으로 답변드리겠습니다.' AS content,0 AS is_pinned,1 AS is_active,0 AS view_count) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM notice WHERE title = '추석 연휴 고객센터 운영 안내');

-- 11-5) 뱃지 마스터
INSERT INTO badge (code, name, description, icon_url, condition_type, condition_value)
SELECT * FROM (SELECT 'FIRST_PAYMENT' AS code,'첫 여행의 시작' AS name,'첫 결제를 완료했어요' AS description,'/badges/first_payment.png' AS icon_url,'PAYMENT_COUNT' AS condition_type,1 AS condition_value) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'FIRST_PAYMENT');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_value)
SELECT * FROM (SELECT 'TRIP_5' AS code,'여행 애호가' AS name,'완료한 여행이 5회를 넘었어요' AS description,'/badges/trip_5.png' AS icon_url,'TRIP_COUNT' AS condition_type,5 AS condition_value) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'TRIP_5');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_value)
SELECT * FROM (SELECT 'TRIP_20' AS code,'여행 마스터' AS name,'완료한 여행이 20회를 넘었어요' AS description,'/badges/trip_20.png' AS icon_url,'TRIP_COUNT' AS condition_type,20 AS condition_value) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'TRIP_20');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_value)
SELECT * FROM (SELECT 'REVIEW_10' AS code,'기록의 달인' AS name,'여행 후기를 10개 이상 작성했어요' AS description,'/badges/review_10.png' AS icon_url,'REVIEW_COUNT' AS condition_type,10 AS condition_value) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'REVIEW_10');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_value)
SELECT * FROM (SELECT 'LOG_10' AS code,'다이어리 작가' AS name,'여행일지를 10개 이상 작성했어요' AS description,'/badges/log_10.png' AS icon_url,'LOG_COUNT' AS condition_type,10 AS condition_value) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'LOG_10');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_value)
SELECT * FROM (SELECT 'COUNTRY_5' AS code,'세계 방랑자' AS name,'5개국 이상을 여행했어요' AS description,'/badges/country_5.png' AS icon_url,'COUNTRY_COUNT' AS condition_type,5 AS condition_value) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_5');

-- 11-6) 히어로 배경 미디어 (사진 3장 + 영상 4개)
-- ⚠ frontend/public/hero/ 폴더에 해당 파일들을 먼저 넣어야 실제로 보입니다.
SET SQL_SAFE_UPDATES = 0;
UPDATE main_background SET is_active = 0 WHERE media_url = 'https://your-image-url.jpg';
SET SQL_SAFE_UPDATES = 1;

INSERT INTO main_background (admin_id, media_type, media_url, is_active)
SELECT * FROM (SELECT 1 AS admin_id,'IMAGE' AS media_type,'/hero/hero-1.jpg' AS media_url,1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM main_background WHERE media_url = '/hero/hero-1.jpg');

INSERT INTO main_background (admin_id, media_type, media_url, is_active)
SELECT * FROM (SELECT 1 AS admin_id,'IMAGE' AS media_type,'/hero/hero-2.jpg' AS media_url,1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM main_background WHERE media_url = '/hero/hero-2.jpg');

INSERT INTO main_background (admin_id, media_type, media_url, is_active)
SELECT * FROM (SELECT 1 AS admin_id,'IMAGE' AS media_type,'/hero/hero-3.jpg' AS media_url,1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM main_background WHERE media_url = '/hero/hero-3.jpg');

INSERT INTO main_background (admin_id, media_type, media_url, is_active)
SELECT * FROM (SELECT 1 AS admin_id,'VIDEO' AS media_type,'/hero/hero-video-1.mp4' AS media_url,1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM main_background WHERE media_url = '/hero/hero-video-1.mp4');

INSERT INTO main_background (admin_id, media_type, media_url, is_active)
SELECT * FROM (SELECT 1 AS admin_id,'VIDEO' AS media_type,'/hero/hero-video-2.mp4' AS media_url,1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM main_background WHERE media_url = '/hero/hero-video-2.mp4');

INSERT INTO main_background (admin_id, media_type, media_url, is_active)
SELECT * FROM (SELECT 1 AS admin_id,'VIDEO' AS media_type,'/hero/hero-video-3.mp4' AS media_url,1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM main_background WHERE media_url = '/hero/hero-video-3.mp4');

INSERT INTO main_background (admin_id, media_type, media_url, is_active)
SELECT * FROM (SELECT 1 AS admin_id,'VIDEO' AS media_type,'/hero/hero-video-4.mp4' AS media_url,1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM main_background WHERE media_url = '/hero/hero-video-4.mp4');

-- 11-7) 관리자 권한 부여 (본인 계정으로 바꿔서 실행하세요)
-- ⚠ 이 이메일이 users 테이블에 없으면 이 UPDATE는 그냥 0건 영향으로 조용히 끝납니다.
--   본인이 가입한 이메일로 반드시 바꿔서 실행하세요.
UPDATE users SET role = 'ADMIN' WHERE email = 'dudwo1410@nate.com';

-- 11-8) 제주 이미지 오류 수정
-- 기존 이미지(unsplash photo-1544006659-f0b21884ce1d)가 노트북 사진이라 실제 제주 사진으로 교체.
-- 이미 이 스크립트를 예전에 한 번 실행해서 잘못된 URL로 행이 이미 들어가 있는 경우를 위한
-- 재실행용 UPDATE (위 11-1/11-3의 INSERT는 WHERE NOT EXISTS라 이미 있는 행은 안 바뀌기 때문).
SET SQL_SAFE_UPDATES = 0;
UPDATE city
SET image_url = 'https://images.pexels.com/photos/30966636/pexels-photo-30966636.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE name_ko = '제주'
  AND image_url = 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?auto=format&fit=crop&w=400';

UPDATE monthly_destination
SET image_url = 'https://images.pexels.com/photos/30966636/pexels-photo-30966636.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE destination_name = '제주도'
  AND image_url = 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?auto=format&fit=crop&w=800';
SET SQL_SAFE_UPDATES = 1;


-- ════════════════════════════════════════════════════════════════
-- 12. 뱃지 도감 — 국가별 뱃지 + 레벨업 마일스톤 뱃지
--     (이미 badge 테이블이 있는 기존 DB에도 안전하게 재실행 가능)
-- ════════════════════════════════════════════════════════════════

-- 12-1) condition_type에 COUNTRY_VISIT(국가별 도감용) / LEVEL_REACHED(레벨업 뱃지용) 추가
ALTER TABLE badge MODIFY COLUMN condition_type
    ENUM('PAYMENT_COUNT','TRIP_COUNT','REVIEW_COUNT','LOG_COUNT','COUNTRY_COUNT','COUNTRY_VISIT','LEVEL_REACHED','MANUAL')
    NOT NULL COMMENT '자동 지급 조건 종류 (MANUAL=관리자 수동 지급)';

-- 12-2) 국가별 뱃지를 위한 국가 코드 컬럼 추가 (없으면 추가)
ALTER TABLE badge ADD COLUMN IF NOT EXISTS condition_country_code VARCHAR(2) NULL
    COMMENT 'condition_type=COUNTRY_VISIT일 때 대상 국가 코드 (city.country_code와 매칭, 도감용)';

-- 12-3) 국가별 뱃지 (도감) — city 테이블에 등록된 국가 기준
INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_JP' AS code,'일본 여행자' AS name,'일본으로 떠나는 여행을 계획했어요' AS description,'/badges/country_jp.png' AS icon_url,'COUNTRY_VISIT' AS condition_type,'JP' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_JP');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_TH' AS code,'태국 여행자' AS name,'태국으로 떠나는 여행을 계획했어요' AS description,'/badges/country_th.png' AS icon_url,'COUNTRY_VISIT' AS condition_type,'TH' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_TH');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_VN' AS code,'베트남 여행자' AS name,'베트남으로 떠나는 여행을 계획했어요' AS description,'/badges/country_vn.png' AS icon_url,'COUNTRY_VISIT' AS condition_type,'VN' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_VN');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_FR' AS code,'프랑스 여행자' AS name,'프랑스로 떠나는 여행을 계획했어요' AS description,'/badges/country_fr.png' AS icon_url,'COUNTRY_VISIT' AS condition_type,'FR' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_FR');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_KR' AS code,'국내 여행자' AS name,'국내(대한민국)로 떠나는 여행을 계획했어요' AS description,'/badges/country_kr.png' AS icon_url,'COUNTRY_VISIT' AS condition_type,'KR' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_KR');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_US' AS code,'미국 여행자' AS name,'미국으로 떠나는 여행을 계획했어요' AS description,'/badges/country_us.png' AS icon_url,'COUNTRY_VISIT' AS condition_type,'US' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_US');

-- 12-4) 레벨업 마일스톤 뱃지 (LevelPolicy.java의 레벨 구간과 맞춤: 1~10)
INSERT INTO badge (code, name, description, icon_url, condition_type, condition_value)
SELECT * FROM (SELECT 'LEVEL_1' AS code,'Lv.1 새싹 여행자' AS name,'레벨 1을 달성했어요' AS description,'/badges/level_1.png' AS icon_url,'LEVEL_REACHED' AS condition_type,1 AS condition_value) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'LEVEL_1');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_value)
SELECT * FROM (SELECT 'LEVEL_3' AS code,'Lv.3 초보 여행자' AS name,'레벨 3을 달성했어요' AS description,'/badges/level_3.png' AS icon_url,'LEVEL_REACHED' AS condition_type,3 AS condition_value) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'LEVEL_3');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_value)
SELECT * FROM (SELECT 'LEVEL_5' AS code,'Lv.5 여행 애호가' AS name,'레벨 5를 달성했어요' AS description,'/badges/level_5.png' AS icon_url,'LEVEL_REACHED' AS condition_type,5 AS condition_value) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'LEVEL_5');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_value)
SELECT * FROM (SELECT 'LEVEL_7' AS code,'Lv.7 베테랑 여행자' AS name,'레벨 7을 달성했어요' AS description,'/badges/level_7.png' AS icon_url,'LEVEL_REACHED' AS condition_type,7 AS condition_value) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'LEVEL_7');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_value)
SELECT * FROM (SELECT 'LEVEL_10' AS code,'Lv.10 여행 마스터' AS name,'최고 레벨(10)을 달성했어요' AS description,'/badges/level_10.png' AS icon_url,'LEVEL_REACHED' AS condition_type,10 AS condition_value) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'LEVEL_10');


-- ════════════════════════════════════════════════════════════════
-- 13. 뱃지 시스템 제거 (레벨 시스템만 유지)
--     담당자 요청으로 뱃지(국가 도감/레벨업 마일스톤 포함) 전체를 프론트/백엔드/DB에서 제거.
--     레벨 계산(LevelPolicy/LevelService)은 뱃지 테이블에 의존하지 않으므로 그대로 유지됨.
--     자식 테이블(user_badge)을 먼저 지우고 부모 테이블(badge)을 지워야 FK 에러가 안 남.
-- ════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS user_badge;
DROP TABLE IF EXISTS badge;
ALTER TABLE banner ADD COLUMN media_type ENUM('IMAGE','VIDEO') NOT NULL DEFAULT 'IMAGE' COMMENT '배너 미디어 타입' AFTER title;