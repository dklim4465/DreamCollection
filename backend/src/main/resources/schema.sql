-- 회원가입 관련 최소 스키마 (users / phone_verifications / email_verifications)
-- 로컬 개발용: spring.sql.init.mode=always 설정 시 앱 기동할 때마다 실행됨(IF NOT EXISTS라 안전)
-- 다른 도메인(trip, board, chat ...) 테이블은 각 담당자가 schema_partN.sql 로 추가 예정

CREATE TABLE IF NOT EXISTS users (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    uuid               VARCHAR(36)  NOT NULL,
    email              VARCHAR(255) NOT NULL,
    password_hash      VARCHAR(255),
    name               VARCHAR(50)  NOT NULL,
    nickname           VARCHAR(30)  NOT NULL,
    phone              VARCHAR(20),
    phone_verified     BOOLEAN      NOT NULL DEFAULT FALSE,
    email_verified     BOOLEAN      NOT NULL DEFAULT FALSE,
    profile_image_url  VARCHAR(500),
    travel_style       VARCHAR(20)  NOT NULL,
    role               VARCHAR(20)  NOT NULL,
    status             VARCHAR(20)  NOT NULL,
    created_at         DATETIME     NOT NULL,
    updated_at         DATETIME     NOT NULL,
    withdrawn_at       DATETIME,
    CONSTRAINT uk_users_email    UNIQUE (email),
    CONSTRAINT uk_users_uuid     UNIQUE (uuid),
    CONSTRAINT uk_users_nickname UNIQUE (nickname)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS phone_verifications (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    phone       VARCHAR(20)  NOT NULL,
    code        VARCHAR(10)  NOT NULL,
    expires_at  DATETIME     NOT NULL,
    verified_at DATETIME,
    created_at  DATETIME     NOT NULL,
    INDEX idx_phone_verifications_phone_created (phone, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS email_verifications (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(255) NOT NULL,
    code        VARCHAR(10)  NOT NULL,
    purpose     VARCHAR(20)  NOT NULL DEFAULT 'SIGNUP',
    expires_at  DATETIME     NOT NULL,
    verified_at DATETIME,
    created_at  DATETIME     NOT NULL,
    INDEX idx_email_verifications_email_created (email, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 소셜 로그인(카카오/구글/네이버) 연동 정보. UserOauthAccount 엔티티와 매핑됨.
-- ※ 실제 정식 스키마는 팀 공용 schema_part1_users.sql 기준입니다. 이 파일은 참고용/미사용 스텁입니다.
CREATE TABLE IF NOT EXISTS user_oauth_accounts (
    id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT UNSIGNED NOT NULL,
    provider          ENUM('GOOGLE','KAKAO','NAVER') NOT NULL,
    provider_user_id  VARCHAR(255) NOT NULL,
    access_token      VARCHAR(1000),
    refresh_token     VARCHAR(1000),
    linked_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_oauth_provider UNIQUE (provider, provider_user_id),
    CONSTRAINT fk_user_oauth_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_oauth_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
