-- ════════════════════════════════════════════════════════════════
-- Dream Collection (dreamConnection) — 통합 스키마 + 시드데이터
--
-- 대상 DBMS : MySQL 8.x / MariaDB 10.6+ (InnoDB, utf8mb4)
-- 실행 방법 : 이 파일 하나만 처음부터 끝까지 실행하면 됩니다.
--
-- ⚠ 원본 실행 이력 대비 정리한 내용
--  - mate_request 가 두 번 정의돼 있던 것을 최신 버전(message 컬럼 포함)
--    하나로 통합했습니다.
--  - users.id 는 BIGINT(signed)인데 badge/user_badge/place/mate_request/
--    friendship 이 BIGINT UNSIGNED 로 FK를 걸고 있어 생성이 실패할 수
--    있던 문제를 BIGINT 로 통일해서 고쳤습니다.
--  - ALTER TABLE 로 나중에 추가했던 컬럼(banner.media_type/banner_type,
--    badge.condition_country_code, users.nickname_changed_at)은 처음
--    CREATE TABLE 안에 포함시켰습니다.
--  - USE traveldb / DESCRIBE / SELECT DATABASE() 등 디버그 쿼리,
--    컬럼 수가 안 맞는 미완성 INSERT, city insert 후 바로 delete하던
--    모순된 구문은 제거했습니다.
--  - admin_id=1 하드코딩 대신, dudwo1410@nate.com 계정을 우선으로 하고
--    없으면 가장 먼저 가입한 사용자를 관리자로 동적 조회하도록 통일했습니다.
--  - 맨 아래 "관리자 권한 부여" 문의 이메일을 본인 계정으로 바꿔서
--    실행해주세요.
-- ════════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS dreamConnection
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE dreamConnection;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS
    `feedback`,
    `chatbot_message`,
    `payment_travelers`,
    `payment_order_items`,
    `payment_orders`,
    `user_coupon`,
    `coupon`,
    `mate_schedule_link`,
    `mate_review`,
    `mate_request`,
    `chat_message`,
    `chat_room_member`,
    `chat_room`,
    `mate_post`,
    `report`,
    `board_like`,
    `board_image`,
    `board_comment`,
    `board_post`,
    `password_reset_tokens`,
    `phone_verifications`,
    `email_verifications`,
    `user_payment_cards`,
    `user_oauth_accounts`,
    `refresh_tokens`,
    `login_history`,
    `notification`,
    `block`,
    `notice`,
    `monthly_destination`,
    `main_background`,
    `checklist_item`,
    `banner`,
    `place`,
    `friendship`,
    `user_badge`,
    `badge`,
    `Media`,
    `TripLog_tags`,
    `Spot`,
    `TripLog`,
    `accommodations`,
    `airports`,
    `saved_trips`,
    `city`,
    `users`;


-- =========================================================
-- users
-- =========================================================

CREATE TABLE `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `uuid` VARCHAR(36) NOT NULL UNIQUE,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255),
    `name` VARCHAR(50) NOT NULL,
    `nickname` VARCHAR(30) NOT NULL UNIQUE,
    `nickname_changed_at` DATETIME,
    `phone` VARCHAR(20),
    `phone_verified` BOOLEAN NOT NULL DEFAULT FALSE,
    `email_verified` BOOLEAN NOT NULL DEFAULT FALSE,
    `profile_image_url` VARCHAR(500),
    `travel_style` VARCHAR(20) NOT NULL,
    `role` VARCHAR(20) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `withdrawn_at` DATETIME,

    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_nickname` (`nickname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- city
-- =========================================================

CREATE TABLE `city` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name_ko` VARCHAR(100) NOT NULL,
    `name_en` VARCHAR(100) NOT NULL,
    `country_code` VARCHAR(2) NOT NULL,
    `country_name` VARCHAR(50) NOT NULL,
    `latitude` DECIMAL(10,7) NOT NULL,
    `longitude` DECIMAL(10,7) NOT NULL,
    `timezone` VARCHAR(50),
    `image_url` VARCHAR(500),
    `is_popular` BOOLEAN NOT NULL DEFAULT FALSE,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_city_country_code` (`country_code`),
    INDEX `idx_city_is_popular` (`is_popular`),
    INDEX `idx_city_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- saved_trips
-- =========================================================

CREATE TABLE `saved_trips` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,

    `conditions_json` TEXT,
    `recommendation_json` LONGTEXT NOT NULL,

    `flight_selection_json` TEXT,
    `accommodation_selection_json` TEXT,

    `created_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_saved_trips_user_id` (`user_id`),

    CONSTRAINT `fk_saved_trips_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- payment_orders / payment_order_items / payment_travelers
-- (토스페이먼츠 결제 기능용. 원래 BIGINT UNSIGNED로 users/saved_trips를
--  참조하고 있었는데, users.id/saved_trips.id는 이 파일 맨 위 설명대로
--  전부 BIGINT(signed)로 통일했기 때문에 그거에 맞춰 BIGINT로 바꿨습니다
--  — 타입이 안 맞으면 FK 생성 자체가 실패하거나 경고가 남습니다.)
-- =========================================================

CREATE TABLE `payment_orders` (
    `id`            BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_id`      VARCHAR(64)  NOT NULL COMMENT '토스 주문번호',
    `user_id`       BIGINT       NOT NULL,
    `saved_trip_id` BIGINT       NOT NULL,
    `adult_count`   INT UNSIGNED NOT NULL,
    `total_amount`  INT UNSIGNED NOT NULL,
    `status`        VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY `uk_payment_orders_order_id` (`order_id`),
    KEY `idx_payment_orders_user` (`user_id`),

    CONSTRAINT `fk_payment_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
    CONSTRAINT `fk_payment_orders_saved_trip` FOREIGN KEY (`saved_trip_id`) REFERENCES `saved_trips` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `payment_order_items` (
    `id`         BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_pk`   BIGINT       NOT NULL,
    `item_type`  VARCHAR(20)  NOT NULL COMMENT 'FLIGHT / HOTEL',
    `unit_price` INT UNSIGNED NULL COMMENT '항공: 1인 왕복 단가',
    `quantity`   INT UNSIGNED NULL COMMENT '항공: 인원수',
    `amount`     INT UNSIGNED NOT NULL COMMENT '항목 총액(스냅샷)',
    `title`      VARCHAR(200) NULL,

    KEY `idx_poi_order` (`order_pk`),
    CONSTRAINT `fk_poi_order` FOREIGN KEY (`order_pk`) REFERENCES `payment_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `payment_travelers` (
    `id`                BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_pk`          BIGINT       NOT NULL,
    `full_name`         VARCHAR(50)  NOT NULL,
    `birth_date`        DATE         NOT NULL,
    `gender`            CHAR(1)      NOT NULL COMMENT 'M/F',
    `passport_number`   VARCHAR(30)  NOT NULL,
    `passport_expiry`   DATE         NOT NULL,
    `phone`             VARCHAR(20)  NULL,
    `is_representative` TINYINT(1)   NOT NULL DEFAULT 0,
    `sort_order`        INT UNSIGNED NOT NULL DEFAULT 0,

    KEY `idx_pt_order` (`order_pk`),
    CONSTRAINT `fk_pt_order` FOREIGN KEY (`order_pk`) REFERENCES `payment_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- airports
-- =========================================================

CREATE TABLE `airports` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,

    `airport_code` VARCHAR(10) NOT NULL,
    `airport_name` VARCHAR(100) NOT NULL,

    `city_name` VARCHAR(100),
    `country_name` VARCHAR(100),
    `region` VARCHAR(100),

    `latitude` DECIMAL(10,7),
    `longitude` DECIMAL(10,7),

    `provider` VARCHAR(50),
    `provider_airport_id` VARCHAR(100),

    `display_order` INT,

    INDEX `idx_airports_region` (`region`),
    INDEX `idx_airports_display_order` (`display_order`),
    INDEX `idx_airports_airport_code` (`airport_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- accommodations
-- =========================================================

CREATE TABLE `accommodations` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,

    `accommodation_name` VARCHAR(150) NOT NULL,
    `accommodation_type` VARCHAR(50),

    `city_name` VARCHAR(100),
    `country_name` VARCHAR(100),
    `region` VARCHAR(100),

    `address` VARCHAR(255),

    `latitude` DECIMAL(10,7),
    `longitude` DECIMAL(10,7),

    `price` DECIMAL(12,2),
    `currency` VARCHAR(10),

    `rating` DECIMAL(3,2),

    `provider` VARCHAR(50),
    `provider_accommodation_id` VARCHAR(100),

    `external_url` VARCHAR(500),
    `image_url` VARCHAR(500),

    `display_order` INT,

    INDEX `idx_accommodations_region` (`region`),
    INDEX `idx_accommodations_display_order` (`display_order`),
    INDEX `idx_accommodations_price` (`price`),
    INDEX `idx_accommodations_rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- TripLog
-- =========================================================

CREATE TABLE `TripLog` (
    `tno` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `title` VARCHAR(150),
    `start_date` DATE,
    `end_date` DATE,
    `thumbnail_path` VARCHAR(500),
    `country_code` CHAR(2) COMMENT '이 여행 기록의 여행 국가 (badge.condition_country_code와 매칭, 저장 시 국가 뱃지 자동 지급용)',
    `description` TEXT,

    INDEX `idx_triplog_start_date` (`start_date`),
    INDEX `idx_triplog_end_date` (`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- Spot
-- MariaDB에서는 POINT SRID 4326 제거
-- SPATIAL INDEX 대상이므로 center_location은 NOT NULL 유지
-- =========================================================

CREATE TABLE `Spot` (
    `sno` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150),
    `description` TEXT,
    `center_location` POINT NOT NULL,
    `visit_at` DATETIME NOT NULL,
    `spot_type` VARCHAR(30) NOT NULL,
    `spot_source` VARCHAR(50),
    `timezone` VARCHAR(50),
    `country` CHAR(2),
    `iata_code` CHAR(3),
    `cover_image_path` VARCHAR(500),
    `trip_id` BIGINT NOT NULL,

    INDEX `idx_spot_trip_id` (`trip_id`),
    INDEX `idx_spot_visit_at` (`visit_at`),
    INDEX `idx_spot_spot_type` (`spot_type`),
    SPATIAL INDEX `spidx_spot_center_location` (`center_location`),

    CONSTRAINT `fk_spot_triplog`
        FOREIGN KEY (`trip_id`)
        REFERENCES `TripLog` (`tno`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- TripLog_tags
-- =========================================================

CREATE TABLE `TripLog_tags` (
    `trip_log_tno` BIGINT NOT NULL,
    `tags` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`trip_log_tno`, `tags`),

    CONSTRAINT `fk_triplog_tags_triplog`
        FOREIGN KEY (`trip_log_tno`)
        REFERENCES `TripLog` (`tno`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- Media
-- MariaDB에서는 POINT SRID 4326 제거
-- location은 NULL 가능하므로 SPATIAL INDEX 걸지 않음
-- =========================================================

CREATE TABLE `Media` (
    `mno` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `media_type` VARCHAR(20) NOT NULL,
    `stored_file_name` VARCHAR(255) NOT NULL,
    `file_size` BIGINT,
    `mime_type` VARCHAR(100),
    `location` POINT,
    `media_text` TEXT,
    `media_path` VARCHAR(500) NOT NULL,
    `taken_at` DATETIME,
    `trip_id` BIGINT NOT NULL,
    `spot_id` BIGINT,

    INDEX `idx_media_trip_id` (`trip_id`),
    INDEX `idx_media_spot_id` (`spot_id`),
    INDEX `idx_media_taken_at` (`taken_at`),
    INDEX `idx_media_media_type` (`media_type`),

    CONSTRAINT `fk_media_triplog`
        FOREIGN KEY (`trip_id`)
        REFERENCES `TripLog` (`tno`)
        ON DELETE CASCADE,

    CONSTRAINT `fk_media_spot`
        FOREIGN KEY (`spot_id`)
        REFERENCES `Spot` (`sno`)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- badge / user_badge
-- (condition_country_code, COUNTRY_VISIT/LEVEL_REACHED 는
--  원본에서 ALTER로 나중에 추가했던 것을 여기 처음부터 포함)
-- =========================================================

CREATE TABLE `badge` (
    `id`                    BIGINT AUTO_INCREMENT PRIMARY KEY,

    `code`                  VARCHAR(50)  NOT NULL COMMENT '내부 식별 코드, 예: FIRST_PAYMENT',
    `name`                  VARCHAR(50)  NOT NULL COMMENT '뱃지 이름, 예: 첫 결제 완료',
    `description`           VARCHAR(255) NOT NULL,
    `icon_url`              VARCHAR(500) NOT NULL,

    `condition_type`        ENUM('PAYMENT_COUNT','TRIP_COUNT','REVIEW_COUNT','LOG_COUNT','COUNTRY_COUNT','COUNTRY_VISIT','LEVEL_REACHED','MANUAL')
                                 NOT NULL COMMENT '자동 지급 조건 종류 (MANUAL=관리자 수동 지급)',
    `condition_value`       INT UNSIGNED NULL COMMENT '조건 달성 기준치 (예: LEVEL_REACHED=5 → 레벨 5 달성)',
    `condition_country_code` VARCHAR(2)  NULL COMMENT 'condition_type=COUNTRY_VISIT일 때 대상 국가 코드 (city.country_code와 매칭, 도감용)',

    `is_active`             TINYINT(1)   NOT NULL DEFAULT 1,
    `created_at`            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY `uk_badge_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='뱃지 마스터';

CREATE TABLE `user_badge` (
    `id`                BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id`           BIGINT NOT NULL,
    `badge_id`          BIGINT NOT NULL,

    `earned_at`         DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `is_representative` TINYINT(1) NOT NULL DEFAULT 0
                            COMMENT '닉네임 옆에 대표로 노출할 뱃지 (사용자가 선택, 1개 권장)',

    UNIQUE KEY `uk_user_badge` (`user_id`, `badge_id`) COMMENT '동일 뱃지 중복 획득 방지',
    KEY `idx_user_badge_badge` (`badge_id`),
    CONSTRAINT `fk_user_badge_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_user_badge_badge` FOREIGN KEY (`badge_id`) REFERENCES `badge`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='사용자 획득 뱃지';


-- =========================================================
-- admin content (banner / main_background / monthly_destination / notice)
-- banner.media_type, banner.banner_type 은 원본에서 ALTER로
-- 나중에 붙인 것을 여기 처음부터 포함
-- =========================================================

CREATE TABLE `banner` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `admin_id` BIGINT NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `media_type` ENUM('IMAGE','VIDEO') NOT NULL DEFAULT 'IMAGE' COMMENT '배너 미디어 타입',
    `banner_type` ENUM('POPUP','CORNER_AD') NOT NULL DEFAULT 'POPUP'
        COMMENT '배너 노출 위치: POPUP=중앙 모달, CORNER_AD=우측 상단 코너 광고',
    `image_url` VARCHAR(500) NOT NULL,
    `link_url` VARCHAR(500),
    `display_order` INT NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `start_at` DATETIME,
    `end_at` DATETIME,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_banner_admin_id` (`admin_id`),
    INDEX `idx_banner_is_active` (`is_active`),
    INDEX `idx_banner_display_order` (`display_order`),

    CONSTRAINT `fk_banner_admin`
        FOREIGN KEY (`admin_id`)
        REFERENCES `users` (`id`)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `main_background` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `admin_id` BIGINT NOT NULL,
    `media_type` VARCHAR(10) NOT NULL,
    `media_url` VARCHAR(500) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `start_at` DATETIME,
    `end_at` DATETIME,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_main_background_admin_id` (`admin_id`),
    INDEX `idx_main_background_is_active` (`is_active`),

    CONSTRAINT `fk_main_background_admin`
        FOREIGN KEY (`admin_id`)
        REFERENCES `users` (`id`)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `monthly_destination` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `admin_id` BIGINT NOT NULL,
    `display_month` VARCHAR(7) NOT NULL,
    `destination_name` VARCHAR(100) NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `description` VARCHAR(500),
    `image_url` VARCHAR(500) NOT NULL,
    `link_url` VARCHAR(500),
    `source_type` VARCHAR(20) NOT NULL,
    `display_order` INT NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_monthly_destination_admin_id` (`admin_id`),
    INDEX `idx_monthly_destination_display_month` (`display_month`),
    INDEX `idx_monthly_destination_is_active` (`is_active`),

    CONSTRAINT `fk_monthly_destination_admin`
        FOREIGN KEY (`admin_id`)
        REFERENCES `users` (`id`)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `notice` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `admin_id` BIGINT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `content` TEXT NOT NULL,
    `coupon_code` VARCHAR(50) NULL COMMENT '이 공지를 읽고 "쿠폰받기"를 누르면 지급되는 쿠폰 코드 (coupon.code 참조, NULL이면 일반 공지)',
    `is_pinned` BOOLEAN NOT NULL DEFAULT FALSE,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `view_count` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_notice_admin_id` (`admin_id`),
    INDEX `idx_notice_is_pinned` (`is_pinned`),
    INDEX `idx_notice_is_active` (`is_active`),

    CONSTRAINT `fk_notice_admin`
        FOREIGN KEY (`admin_id`)
        REFERENCES `users` (`id`)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- checklist
-- request_id의 FK 대상이 불명확해서 FK 제외 (원본 그대로 유지)
-- =========================================================

CREATE TABLE `checklist_item` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `request_id` BIGINT NOT NULL,
    `content` VARCHAR(150) NOT NULL,
    `category` VARCHAR(30),
    `is_checked` BOOLEAN NOT NULL DEFAULT FALSE,
    `display_order` INT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `checked_at` DATETIME,

    INDEX `idx_checklist_item_request_id` (`request_id`),
    INDEX `idx_checklist_item_category` (`category`),
    INDEX `idx_checklist_item_is_checked` (`is_checked`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 친구 관계 (원본 마지막 부분에 추가돼있던 friendship 테이블)
-- users.id 타입(BIGINT)에 맞춰 FK 타입 통일
-- =========================================================

CREATE TABLE `friendship` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `requester_id` BIGINT NOT NULL,
    `receiver_id` BIGINT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY `uk_friendship` (`requester_id`, `receiver_id`),
    INDEX `idx_friendship_receiver` (`receiver_id`),

    CONSTRAINT `fk_friendship_requester` FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_friendship_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT `chk_friendship_not_self` CHECK (`requester_id` <> `receiver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 외부 장소 캐시 (원본 마지막 부분에 추가돼있던 place 테이블)
-- =========================================================

CREATE TABLE `place` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `external_place_id` VARCHAR(255) NOT NULL,
    `source` VARCHAR(30) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `category` VARCHAR(30) NOT NULL,
    `address` VARCHAR(500),
    `latitude` DECIMAL(10, 7),
    `longitude` DECIMAL(10, 7),
    `city` VARCHAR(100) NOT NULL,
    `region` VARCHAR(100),
    `country` VARCHAR(100),
    `country_code` VARCHAR(2),
    `rating` DECIMAL(3, 2),
    `review_count` INT,
    `price_level` VARCHAR(20),
    `place_type` VARCHAR(100),
    `opening_hours_text` VARCHAR(500),
    `description` TEXT,
    `image_url` VARCHAR(1000),
    `external_url` VARCHAR(1000),
    `active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY `uk_place_source_external` (`source`, `external_place_id`),
    INDEX `idx_place_city_active` (`city`, `active`),
    INDEX `idx_place_city_category` (`city`, `category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- user relation / notification
-- =========================================================

CREATE TABLE `block` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `blocked_user_id` BIGINT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY `uk_block_user_blocked` (`user_id`, `blocked_user_id`),
    INDEX `idx_block_user_id` (`user_id`),
    INDEX `idx_block_blocked_user_id` (`blocked_user_id`),

    CONSTRAINT `fk_block_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE,

    CONSTRAINT `fk_block_blocked_user`
        FOREIGN KEY (`blocked_user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `notification` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `type` VARCHAR(30) NOT NULL,
    `target_type` VARCHAR(20),
    `target_id` BIGINT,
    `content` VARCHAR(255) NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_notification_user_id` (`user_id`),
    INDEX `idx_notification_is_read` (`is_read`),
    INDEX `idx_notification_created_at` (`created_at`),

    CONSTRAINT `fk_notification_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- auth
-- =========================================================

CREATE TABLE `login_history` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `login_type` VARCHAR(20) NOT NULL,
    `ip_address` VARCHAR(45),
    `user_agent` VARCHAR(255),
    `success` BOOLEAN NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_login_history_user_id` (`user_id`),
    INDEX `idx_login_history_created_at` (`created_at`),

    CONSTRAINT `fk_login_history_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `refresh_tokens` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `token` VARCHAR(500) NOT NULL,
    `user_agent` VARCHAR(255),
    `ip_address` VARCHAR(45),
    `expires_at` DATETIME NOT NULL,
    `revoked_at` DATETIME,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_refresh_tokens_user_id` (`user_id`),
    INDEX `idx_refresh_tokens_expires_at` (`expires_at`),

    CONSTRAINT `fk_refresh_tokens_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `user_oauth_accounts` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `provider` VARCHAR(20) NOT NULL,
    `provider_user_id` VARCHAR(255) NOT NULL,
    `access_token` VARCHAR(1000),
    `refresh_token` VARCHAR(1000),
    `linked_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY `uk_user_oauth_provider_user` (`provider`, `provider_user_id`),
    INDEX `idx_user_oauth_user_id` (`user_id`),

    CONSTRAINT `fk_user_oauth_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `user_payment_cards` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `card_company` VARCHAR(30),
    `card_last4` VARCHAR(4),
    `billing_key` VARCHAR(255) NOT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted_at` DATETIME,

    INDEX `idx_user_payment_cards_user_id` (`user_id`),

    CONSTRAINT `fk_user_payment_cards_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `email_verifications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `purpose` VARCHAR(20) NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `verified_at` DATETIME,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_email_verifications_email` (`email`),
    INDEX `idx_email_verifications_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `phone_verifications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `phone` VARCHAR(20) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `verified_at` DATETIME,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_phone_verifications_phone` (`phone`),
    INDEX `idx_phone_verifications_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `password_reset_tokens` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `token` VARCHAR(64) NOT NULL UNIQUE,
    `expires_at` DATETIME NOT NULL,
    `used_at` DATETIME,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_password_reset_tokens_user_id` (`user_id`),
    INDEX `idx_password_reset_tokens_expires_at` (`expires_at`),

    CONSTRAINT `fk_password_reset_tokens_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- board
-- =========================================================

CREATE TABLE `board_post` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `category` VARCHAR(20) NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `content` TEXT NOT NULL,
    `price` DECIMAL(10,2),
    `view_count` INT NOT NULL DEFAULT 0,
    `like_count` INT NOT NULL DEFAULT 0,
    `trade_status` VARCHAR(20),
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_board_post_user_id` (`user_id`),
    INDEX `idx_board_post_category` (`category`),
    INDEX `idx_board_post_created_at` (`created_at`),

    CONSTRAINT `fk_board_post_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `board_comment` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `post_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `parent_comment_id` BIGINT,
    `content` VARCHAR(500) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_board_comment_post_id` (`post_id`),
    INDEX `idx_board_comment_user_id` (`user_id`),
    INDEX `idx_board_comment_parent_id` (`parent_comment_id`),

    CONSTRAINT `fk_board_comment_post`
        FOREIGN KEY (`post_id`)
        REFERENCES `board_post` (`id`)
        ON DELETE CASCADE,

    CONSTRAINT `fk_board_comment_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE RESTRICT,

    CONSTRAINT `fk_board_comment_parent`
        FOREIGN KEY (`parent_comment_id`)
        REFERENCES `board_comment` (`id`)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `board_image` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `post_id` BIGINT NOT NULL,
    `image_url` VARCHAR(255) NOT NULL,
    `order_no` INT NOT NULL,

    INDEX `idx_board_image_post_id` (`post_id`),

    CONSTRAINT `fk_board_image_post`
        FOREIGN KEY (`post_id`)
        REFERENCES `board_post` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `board_like` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `post_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY `uk_board_like_post_user` (`post_id`, `user_id`),
    INDEX `idx_board_like_user_id` (`user_id`),

    CONSTRAINT `fk_board_like_post`
        FOREIGN KEY (`post_id`)
        REFERENCES `board_post` (`id`)
        ON DELETE CASCADE,

    CONSTRAINT `fk_board_like_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `report` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `reporter_id` BIGINT NOT NULL,
    `target_type` VARCHAR(20) NOT NULL,
    `target_id` BIGINT NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_report_reporter_id` (`reporter_id`),
    INDEX `idx_report_target` (`target_type`, `target_id`),
    INDEX `idx_report_status` (`status`),

    CONSTRAINT `fk_report_reporter`
        FOREIGN KEY (`reporter_id`)
        REFERENCES `users` (`id`)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- mate
-- =========================================================

CREATE TABLE `mate_post` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `city_id` BIGINT,
    `destination` VARCHAR(100) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `content` TEXT NOT NULL,
    `preferred_age` VARCHAR(20),
    `preferred_gender` VARCHAR(10),
    `travel_style` VARCHAR(50),
    `recruit_count` INT NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_mate_post_user_id` (`user_id`),
    INDEX `idx_mate_post_city_id` (`city_id`),
    INDEX `idx_mate_post_start_date` (`start_date`),
    INDEX `idx_mate_post_status` (`status`),

    CONSTRAINT `fk_mate_post_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE RESTRICT,

    CONSTRAINT `fk_mate_post_city`
        FOREIGN KEY (`city_id`)
        REFERENCES `city` (`id`)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- mate_request: 원본에 두 번 정의돼 있던 것(하나는 message 컬럼 없음,
-- 하나는 BIGINT UNSIGNED + message 컬럼 있음)을 최신 버전 기준으로 통합.
-- FK 타입은 users.id(BIGINT)에 맞춰 BIGINT로 통일.
CREATE TABLE `mate_request` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `mate_post_id` BIGINT NOT NULL,
    `requester_id` BIGINT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    `message` VARCHAR(200) DEFAULT NULL COMMENT '메이트 신청 시 남기는 짧은 메시지',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY `uk_mate_request_post_requester` (`mate_post_id`, `requester_id`),
    INDEX `idx_mate_request_requester_id` (`requester_id`),

    CONSTRAINT `fk_mate_request_post`
        FOREIGN KEY (`mate_post_id`)
        REFERENCES `mate_post` (`id`)
        ON DELETE CASCADE,

    CONSTRAINT `fk_mate_request_requester`
        FOREIGN KEY (`requester_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='메이트 매칭 요청';


CREATE TABLE `mate_review` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `mate_post_id` BIGINT NOT NULL,
    `reviewer_id` BIGINT NOT NULL,
    `reviewee_id` BIGINT NOT NULL,
    `rating` INT NOT NULL,
    `content` VARCHAR(500),
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_mate_review_post_id` (`mate_post_id`),
    INDEX `idx_mate_review_reviewer_id` (`reviewer_id`),
    INDEX `idx_mate_review_reviewee_id` (`reviewee_id`),

    CONSTRAINT `fk_mate_review_post`
        FOREIGN KEY (`mate_post_id`)
        REFERENCES `mate_post` (`id`)
        ON DELETE CASCADE,

    CONSTRAINT `fk_mate_review_reviewer`
        FOREIGN KEY (`reviewer_id`)
        REFERENCES `users` (`id`)
        ON DELETE RESTRICT,

    CONSTRAINT `fk_mate_review_reviewee`
        FOREIGN KEY (`reviewee_id`)
        REFERENCES `users` (`id`)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `mate_schedule_link` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `mate_post_id` BIGINT NOT NULL,
    `request_id` BIGINT NOT NULL,
    `linked_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_mate_schedule_link_post_id` (`mate_post_id`),
    INDEX `idx_mate_schedule_link_request_id` (`request_id`),

    CONSTRAINT `fk_mate_schedule_link_post`
        FOREIGN KEY (`mate_post_id`)
        REFERENCES `mate_post` (`id`)
        ON DELETE CASCADE,

    CONSTRAINT `fk_mate_schedule_link_request`
        FOREIGN KEY (`request_id`)
        REFERENCES `mate_request` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- chat
-- =========================================================

CREATE TABLE `chat_room` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `mate_post_id` BIGINT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_chat_room_mate_post_id` (`mate_post_id`),

    CONSTRAINT `fk_chat_room_mate_post`
        FOREIGN KEY (`mate_post_id`)
        REFERENCES `mate_post` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `chat_room_member` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `room_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `last_read_at` DATETIME,
    `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY `uk_chat_room_member_room_user` (`room_id`, `user_id`),
    INDEX `idx_chat_room_member_user_id` (`user_id`),

    CONSTRAINT `fk_chat_room_member_room`
        FOREIGN KEY (`room_id`)
        REFERENCES `chat_room` (`id`)
        ON DELETE CASCADE,

    CONSTRAINT `fk_chat_room_member_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `chat_message` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `room_id` BIGINT NOT NULL,
    `sender_id` BIGINT NOT NULL,
    `content` VARCHAR(1000) NOT NULL,
    `message_type` VARCHAR(10) NOT NULL,
    `sent_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_chat_message_room_id` (`room_id`),
    INDEX `idx_chat_message_sender_id` (`sender_id`),
    INDEX `idx_chat_message_sent_at` (`sent_at`),

    CONSTRAINT `fk_chat_message_room`
        FOREIGN KEY (`room_id`)
        REFERENCES `chat_room` (`id`)
        ON DELETE CASCADE,

    CONSTRAINT `fk_chat_message_sender`
        FOREIGN KEY (`sender_id`)
        REFERENCES `users` (`id`)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- coupon / user_coupon
-- =========================================================

CREATE TABLE `coupon` (
    `id`              BIGINT AUTO_INCREMENT PRIMARY KEY,
    `code`            VARCHAR(50)  NOT NULL COMMENT '내부 식별 코드, 예: WELCOME10',
    `name`            VARCHAR(100) NOT NULL,
    `description`     VARCHAR(255),
    `discount_type`   ENUM('PERCENT') NOT NULL DEFAULT 'PERCENT',
    `discount_value`  INT UNSIGNED NOT NULL COMMENT '할인율(%), 예: 10 = 10%',
    `valid_from`      DATETIME     NOT NULL,
    `valid_until`     DATETIME     NOT NULL,
    `is_active`       TINYINT(1)   NOT NULL DEFAULT 1,
    `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY `uk_coupon_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='쿠폰 마스터';

CREATE TABLE `user_coupon` (
    `id`          BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id`     BIGINT NOT NULL,
    `coupon_id`   BIGINT NOT NULL,

    `status`      ENUM('AVAILABLE','USED','EXPIRED') NOT NULL DEFAULT 'AVAILABLE',
    `issued_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `used_at`     DATETIME NULL,
    `expires_at`  DATETIME NOT NULL COMMENT '발급 시점 coupon.valid_until 스냅샷',

    UNIQUE KEY `uk_user_coupon` (`user_id`, `coupon_id`) COMMENT '동일 쿠폰 중복 발급 방지 (1인 1매)',
    KEY `idx_user_coupon_user` (`user_id`),
    CONSTRAINT `fk_user_coupon_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_user_coupon_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupon`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='사용자 발급 쿠폰함 (마이페이지 보관함)';


SET FOREIGN_KEY_CHECKS = 1;


-- =========================================================
-- 챗봇 대화 기록 (사용자별로 남겨서, 챗봇 패널을 다시 열거나 새로고침해도
-- 이전 대화가 이어지도록 함. 마이페이지 등에서 "내 챗봇 대화 내역"으로도 활용 가능)
-- =========================================================

CREATE TABLE `chatbot_message` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `role` VARCHAR(10) NOT NULL COMMENT 'user 또는 assistant',
    `content` TEXT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_chatbot_message_user_id` (`user_id`),
    INDEX `idx_chatbot_message_created_at` (`created_at`),

    CONSTRAINT `fk_chatbot_message_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 하단 "문의하기"에서 접수된 건의사항/버그신고 (관리자 페이지 "문의 내역"에서 조회)
-- =========================================================

CREATE TABLE `feedback` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `category` VARCHAR(20) NOT NULL COMMENT 'BUG / SUGGESTION / ETC',
    `message` TEXT NOT NULL,
    `checked` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_feedback_created_at` (`created_at`),
    INDEX `idx_feedback_checked` (`checked`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ════════════════════════════════════════════════════════════════
-- 시드 데이터
-- ════════════════════════════════════════════════════════════════

-- ---------------------------------------------------------
-- 공항
-- ---------------------------------------------------------
INSERT INTO airports
(airport_code, airport_name, city_name, country_name, region, display_order)
VALUES
('NRT', '나리타 국제공항', '도쿄', '일본', '일본', 1),
('HND', '하네다 공항', '도쿄', '일본', '일본', 2),
('KIX', '간사이 국제공항', '오사카', '일본', '일본', 3);

INSERT INTO airports
(airport_code, airport_name, city_name, country_name, region, latitude, longitude, display_order)
VALUES
('JFK', '존 F. 케네디 국제공항', '뉴욕', '미국', '미국', 40.6413000, -73.7781000, 1),
('EWR', '뉴어크 리버티 국제공항', '뉴욕', '미국', '미국', 40.6895000, -74.1745000, 2),
('LAX', '로스앤젤레스 국제공항', '로스앤젤레스', '미국', '미국', 33.9416000, -118.4085000, 1);


-- ---------------------------------------------------------
-- 숙소
-- ---------------------------------------------------------
INSERT INTO accommodations
(accommodation_name, accommodation_type, city_name, country_name, region, address,
 price, currency, rating, provider, external_url, image_url, display_order)
VALUES
('도쿄 시티 호텔', 'HOTEL', '도쿄', '일본', '일본', '도쿄 신주쿠구',
 180000, 'KRW', 4.5, 'DUMMY', 'https://example.com/tokyo-city', 'https://images.unsplash.com/photo-1546874177-9e664107314e?w=800', 1),
('도쿄 스테이 호텔', 'HOTEL', '도쿄', '일본', '일본', '도쿄 시부야구',
 210000, 'KRW', 4.6, 'DUMMY', 'https://example.com/tokyo-stay', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800', 2),
('도쿄 리버사이드 인', 'HOTEL', '도쿄', '일본', '일본', '도쿄 아사쿠사',
 150000, 'KRW', 4.2, 'DUMMY', 'https://example.com/tokyo-river', 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800', 3),
('오사카 센트럴 호텔', 'HOTEL', '오사카', '일본', '일본', '오사카 난바',
 160000, 'KRW', 4.4, 'DUMMY', 'https://example.com/osaka-central', 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800', 1),
('오사카 스테이션 호텔', 'HOTEL', '오사카', '일본', '일본', '오사카 우메다',
 190000, 'KRW', 4.5, 'DUMMY', 'https://example.com/osaka-station', 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800', 2),
('오사카 베이 호텔', 'HOTEL', '오사카', '일본', '일본', '오사카 베이 에어리어',
 220000, 'KRW', 4.7, 'DUMMY', 'https://example.com/osaka-bay', 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800', 3),
('후쿠오카 하카타 호텔', 'HOTEL', '후쿠오카', '일본', '일본', '후쿠오카 하카타',
 140000, 'KRW', 4.3, 'DUMMY', 'https://example.com/fukuoka-hakata', 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=800', 1),
('후쿠오카 텐진 호텔', 'HOTEL', '후쿠오카', '일본', '일본', '후쿠오카 텐진',
 155000, 'KRW', 4.4, 'DUMMY', 'https://example.com/fukuoka-tenjin', 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=800', 2),
('후쿠오카 베이 리조트', 'RESORT', '후쿠오카', '일본', '일본', '후쿠오카 모모치 해변',
 230000, 'KRW', 4.8, 'DUMMY', 'https://example.com/fukuoka-bay', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800', 3);


-- ---------------------------------------------------------
-- 도시
-- ⚠ 원본에서는 이 5건을 넣은 뒤 바로 DELETE FROM city 로 지웠는데,
--    시드 데이터로 남기는 게 맞다고 보고 DELETE는 제거했습니다.
--    (정말 비워둔 상태로 시작하고 싶으시면 아래 INSERT를 지워주세요)
-- ---------------------------------------------------------
INSERT INTO city
(name_ko, name_en, country_code, country_name, latitude, longitude, timezone, image_url, is_popular, is_active, created_at)
VALUES
('도쿄', 'Tokyo', 'JP', '일본', 35.6762000, 139.6503000, 'Asia/Tokyo', 'https://images.unsplash.com/photo-1759970752518-b0ffa38c130b?w=800', true, true, NOW()),
('오사카', 'Osaka', 'JP', '일본', 34.6937000, 135.5023000, 'Asia/Tokyo', 'https://images.unsplash.com/photo-1746890775648-70714f34bd0c?w=800', true, true, NOW()),
('후쿠오카', 'Fukuoka', 'JP', '일본', 33.5902000, 130.4017000, 'Asia/Tokyo', 'https://images.unsplash.com/photo-1574678505748-99e73cc7ee41?w=800', true, true, NOW()),
('방콕', 'Bangkok', 'TH', '태국', 13.7563000, 100.5018000, 'Asia/Bangkok', 'https://images.unsplash.com/photo-1755251042986-91270ffd76f5?w=800', true, true, NOW()),
('치앙마이', 'Chiang Mai', 'TH', '태국', 18.7883000, 98.9853000, 'Asia/Bangkok', 'https://images.pexels.com/photos/33614599/pexels-photo-33614599.jpeg?w=800', true, true, NOW()),
('푸켓', 'Phuket', 'TH', '태국', 7.8804000, 98.3923000, 'Asia/Bangkok', 'https://images.pexels.com/photos/17422289/pexels-photo-17422289.jpeg?w=800', true, true, NOW()),
('뉴욕', 'New York', 'US', '미국', 40.7128000, -74.0060000, 'America/New_York', 'https://images.unsplash.com/photo-1754766621748-2a96cbf56a1f?w=800', true, true, NOW()),
('로스앤젤레스', 'Los Angeles', 'US', '미국', 34.0522000, -118.2437000, 'America/Los_Angeles', 'https://images.pexels.com/photos/29276387/pexels-photo-29276387.jpeg?w=800', true, true, NOW()),
('라스베가스', 'Las Vegas', 'US', '미국', 36.1699000, -115.1398000, 'America/Los_Angeles', 'https://images.pexels.com/photos/19715369/pexels-photo-19715369.jpeg?w=800', true, true, NOW());


-- ---------------------------------------------------------
-- 뱃지 도감 — 국가별 뱃지 (47개국) + 레벨업 마일스톤 + 가입 축하
-- (재실행해도 안전하도록 WHERE NOT EXISTS 패턴 유지)
-- ---------------------------------------------------------
INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_JP' AS code,'일본 여행자' AS name,'일본으로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/jp.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'JP' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_JP');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_TH' AS code,'태국 여행자' AS name,'태국으로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/th.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'TH' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_TH');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_VN' AS code,'베트남 여행자' AS name,'베트남으로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/vn.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'VN' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_VN');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_FR' AS code,'프랑스 여행자' AS name,'프랑스로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/fr.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'FR' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_FR');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_KR' AS code,'국내 여행자' AS name,'국내(대한민국)로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/kr.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'KR' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_KR');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_US' AS code,'미국 여행자' AS name,'미국으로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/us.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'US' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_US');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_EU' AS code,'유럽 여행자' AS name,'유럽으로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/eu.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'EU' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_EU');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_GB' AS code,'영국 여행자' AS name,'영국으로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/gb.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'GB' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_GB');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_CN' AS code,'중국 여행자' AS name,'중국으로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/cn.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'CN' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_CN');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_HK' AS code,'홍콩 여행자' AS name,'홍콩으로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/hk.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'HK' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_HK');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_TW' AS code,'대만 여행자' AS name,'대만으로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/tw.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'TW' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_TW');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_PH' AS code,'필리핀 여행자' AS name,'필리핀으로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/ph.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'PH' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_PH');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_SG' AS code,'싱가포르 여행자' AS name,'싱가포르로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/sg.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'SG' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_SG');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_MY' AS code,'말레이시아 여행자' AS name,'말레이시아로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/my.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'MY' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_MY');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_ID' AS code,'인도네시아 여행자' AS name,'인도네시아로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/id.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'ID' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_ID');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_IN' AS code,'인도 여행자' AS name,'인도로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/in.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'IN' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_IN');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_CA' AS code,'캐나다 여행자' AS name,'캐나다로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/ca.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'CA' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_CA');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_AU' AS code,'호주 여행자' AS name,'호주로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/au.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'AU' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_AU');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_NZ' AS code,'뉴질랜드 여행자' AS name,'뉴질랜드로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/nz.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'NZ' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_NZ');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_CH' AS code,'스위스 여행자' AS name,'스위스로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/ch.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'CH' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_CH');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_TR' AS code,'튀르키예 여행자' AS name,'튀르키예로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/tr.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'TR' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_TR');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_AE' AS code,'아랍에미리트 여행자' AS name,'아랍에미리트로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/ae.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'AE' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_AE');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_SA' AS code,'사우디아라비아 여행자' AS name,'사우디아라비아로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/sa.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'SA' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_SA');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_IL' AS code,'이스라엘 여행자' AS name,'이스라엘로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/il.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'IL' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_IL');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_QA' AS code,'카타르 여행자' AS name,'카타르로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/qa.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'QA' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_QA');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_GU' AS code,'괌 여행자' AS name,'괌으로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/gu.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'GU' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_GU');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_MX' AS code,'멕시코 여행자' AS name,'멕시코로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/mx.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'MX' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_MX');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_BR' AS code,'브라질 여행자' AS name,'브라질로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/br.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'BR' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_BR');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_AR' AS code,'아르헨티나 여행자' AS name,'아르헨티나로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/ar.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'AR' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_AR');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_RU' AS code,'러시아 여행자' AS name,'러시아로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/ru.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'RU' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_RU');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_SE' AS code,'스웨덴 여행자' AS name,'스웨덴으로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/se.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'SE' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_SE');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_NO' AS code,'노르웨이 여행자' AS name,'노르웨이로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/no.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'NO' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_NO');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_DK' AS code,'덴마크 여행자' AS name,'덴마크로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/dk.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'DK' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_DK');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_PL' AS code,'폴란드 여행자' AS name,'폴란드로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/pl.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'PL' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_PL');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_CZ' AS code,'체코 여행자' AS name,'체코로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/cz.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'CZ' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_CZ');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_HU' AS code,'헝가리 여행자' AS name,'헝가리로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/hu.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'HU' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_HU');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_EG' AS code,'이집트 여행자' AS name,'이집트로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/eg.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'EG' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_EG');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_ZA' AS code,'남아프리카공화국 여행자' AS name,'남아프리카공화국으로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/za.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'ZA' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_ZA');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_MN' AS code,'몽골 여행자' AS name,'몽골로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/mn.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'MN' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_MN');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_NP' AS code,'네팔 여행자' AS name,'네팔로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/np.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'NP' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_NP');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_LK' AS code,'스리랑카 여행자' AS name,'스리랑카로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/lk.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'LK' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_LK');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_KH' AS code,'캄보디아 여행자' AS name,'캄보디아로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/kh.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'KH' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_KH');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_LA' AS code,'라오스 여행자' AS name,'라오스로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/la.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'LA' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_LA');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_FJ' AS code,'피지 여행자' AS name,'피지로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/fj.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'FJ' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_FJ');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_MA' AS code,'모로코 여행자' AS name,'모로코로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/ma.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'MA' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_MA');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_KW' AS code,'쿠웨이트 여행자' AS name,'쿠웨이트로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/kw.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'KW' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_KW');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_country_code)
SELECT * FROM (SELECT 'COUNTRY_JO' AS code,'요르단 여행자' AS name,'요르단으로 떠나는 여행을 계획했어요' AS description,'https://flagcdn.com/jo.svg' AS icon_url,'COUNTRY_VISIT' AS condition_type,'JO' AS condition_country_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'COUNTRY_JO');

-- 레벨업 마일스톤 뱃지 (레벨 구간: 1~10)
INSERT INTO badge (code, name, description, icon_url, condition_type, condition_value)
SELECT * FROM (SELECT 'LEVEL_1' AS code,'Lv.1 새싹 여행자' AS name,'레벨 1을 달성했어요' AS description,'/badges/level_1.svg' AS icon_url,'LEVEL_REACHED' AS condition_type,1 AS condition_value) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'LEVEL_1');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_value)
SELECT * FROM (SELECT 'LEVEL_3' AS code,'Lv.3 초보 여행자' AS name,'레벨 3을 달성했어요' AS description,'/badges/level_3.svg' AS icon_url,'LEVEL_REACHED' AS condition_type,3 AS condition_value) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'LEVEL_3');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_value)
SELECT * FROM (SELECT 'LEVEL_5' AS code,'Lv.5 여행 애호가' AS name,'레벨 5를 달성했어요' AS description,'/badges/level_5.svg' AS icon_url,'LEVEL_REACHED' AS condition_type,5 AS condition_value) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'LEVEL_5');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_value)
SELECT * FROM (SELECT 'LEVEL_7' AS code,'Lv.7 베테랑 여행자' AS name,'레벨 7을 달성했어요' AS description,'/badges/level_7.svg' AS icon_url,'LEVEL_REACHED' AS condition_type,7 AS condition_value) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'LEVEL_7');

INSERT INTO badge (code, name, description, icon_url, condition_type, condition_value)
SELECT * FROM (SELECT 'LEVEL_10' AS code,'Lv.10 여행 마스터' AS name,'최고 레벨(10)을 달성했어요' AS description,'/badges/level_10.svg' AS icon_url,'LEVEL_REACHED' AS condition_type,10 AS condition_value) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'LEVEL_10');

-- 가입 축하 뱃지 (회원가입 시 지급하는 'WELCOME' 코드)
INSERT INTO badge (code, name, description, icon_url, condition_type)
SELECT * FROM (SELECT 'WELCOME' AS code,'첫 발걸음' AS name,'드림컬렉션에 가입한 걸 환영해요!' AS description,'/badges/welcome.svg' AS icon_url,'MANUAL' AS condition_type) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM badge WHERE code = 'WELCOME');


-- ---------------------------------------------------------
-- 관리자 콘텐츠 시드 (이달의 여행지 / 배너 / 공지)
--
-- ⚠ 예전 버전은 admin_id를 "이미 가입된 유저" 중에서만 찾았는데,
--   방금 DROP&CREATE로 DB를 새로 만든 직후에는 가입자가 0명이라
--   admin_id가 NULL이 되고, 그 아래 배너/이달의여행지/공지 INSERT가
--   전부 "WHERE @dc_admin_id IS NOT NULL" 가드에 걸려 조용히 스킵됐다.
--   그래서 "SQL은 에러 없이 실행됐는데 화면엔 안 나온다"는 문제가 반복됐다.
--
--   → 실제 유저 존재 여부와 무관하게 항상 존재하는 "시스템 관리자" 계정을
--     먼저 보장해두고, admin_id가 없으면 이 계정을 쓰도록 바꿔서
--     이 문제를 원천적으로 없앴다. (로그인은 안 되는 더미 계정이라 안전함)
-- ---------------------------------------------------------
INSERT INTO users (uuid, email, password_hash, name, nickname, travel_style, role, status)
SELECT UUID(), 'system@dreamcollection.local', '$2a$10$disabledDisabledDisabledDisabledDisabledDis', '드림컬렉션', 'dreamcollection_system', 'RELAXED', 'ADMIN', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'system@dreamcollection.local');

SET @dc_admin_id = (SELECT id FROM users WHERE email = 'dudwo1410@nate.com' LIMIT 1);
SET @dc_admin_id = COALESCE(@dc_admin_id, (SELECT id FROM users WHERE email = 'system@dreamcollection.local' LIMIT 1));

INSERT INTO monthly_destination
    (admin_id, display_month, destination_name, title, description, image_url, link_url, source_type, display_order, is_active, created_at, updated_at)
SELECT @dc_admin_id, DATE_FORMAT(NOW(), '%Y-%m'), t.destination_name, t.title, t.description, t.image_url, NULL, 'AI', t.display_order, 1, NOW(), NOW()
FROM (
    SELECT '제주도' AS destination_name,'제주도 여긴 어떠세요?' AS title,'푸른 바다와 오름이 있는 여름 섬여행, 협재 해수욕장부터 우도까지' AS description,'https://images.unsplash.com/photo-1546874177-9e664107314e?w=800' AS image_url,0 AS display_order UNION ALL
    SELECT '강릉','국내 바다하면 동해! 강릉은 어떠세요?','커피거리와 경포해변이 함께 있는 여름 동해 여행지','https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',1 UNION ALL
    SELECT '부산','여름 바캉스는 부산 해운대에서','해수욕장, 광안리 야경, 도심 풍경을 한 번에 즐기는 도시','https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800',2 UNION ALL
    SELECT '오사카','가까운 여름 해외여행, 오사카 어때요?','도톤보리 야경과 유니버설 스튜디오까지 알찬 3박4일','https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800',3 UNION ALL
    SELECT '다낭','여름엔 다낭이지, 바다와 온천을 한번에','미케비치와 바나힐, 가성비 좋은 동남아 여름휴가','https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',4 UNION ALL
    SELECT '방콕','이국적인 여름밤, 방콕에서 보내보세요','왓아룬 야경과 루프탑 바, 활기찬 야시장 투어','https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800',5 UNION ALL
    SELECT '괌','진짜 여름 휴가, 괌 어떠세요?','투몬비치에서 즐기는 물놀이와 리조트 라이프','https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=800',6 UNION ALL
    SELECT '경포대','여름밤 낭만은 경포대에서','해변과 호수를 동시에 즐기는 강원도 여름 드라이브 코스','https://images.unsplash.com/photo-1499678329028-101435549a4e?w=800',7 UNION ALL
    SELECT '세부','에메랄드빛 바다, 세부에서 여름을','스노클링과 아일랜드 호핑을 즐기는 필리핀 대표 휴양지','https://images.unsplash.com/photo-1573790387438-4da905039392?w=800',8 UNION ALL
    SELECT '나트랑','조용한 여름 바다가 그립다면 나트랑','빈펄랜드와 머드온천까지, 가족여행으로도 딱 좋은 곳','https://images.unsplash.com/photo-1528127269322-539801943592?w=800',9
) AS t
WHERE @dc_admin_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM monthly_destination WHERE destination_name = t.destination_name AND display_month = DATE_FORMAT(NOW(), '%Y-%m'));

-- 우측 상단 코너 광고용 배너
-- ⚠ 이미지 → 구글 데모 영상(BigBuckBunny, 나중에 핫링크 제한 걸려서 흰 화면으로 깨짐) →
--    지금은 실제로 안정적으로 재생 확인된 Pexels 여행 영상(비행기 창문 너머 바다 착륙 장면)
--    으로 최종 정리했습니다. title은 화면에 그대로 노출되는 홍보 문구로 씀
--    (CornerAdBanner.tsx가 banner.title을 영상 위 캡션으로 렌더링).
INSERT INTO banner (admin_id, title, media_type, banner_type, image_url, link_url, display_order, is_active, created_at, updated_at)
SELECT @dc_admin_id, '당신의 다음 여행지는 어디인가요? ✈️', 'VIDEO', 'CORNER_AD', 'https://videos.pexels.com/video-files/1223362/1223362-hd_1280_720_30fps.mp4', NULL, 0, 1, NOW(), NOW()
WHERE @dc_admin_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM banner WHERE banner_type = 'CORNER_AD');


-- ---------------------------------------------------------
-- 쿠폰 (2026년 7월 신규가입 이벤트)
-- ---------------------------------------------------------
INSERT INTO coupon (code, name, description, discount_type, discount_value, valid_from, valid_until, is_active)
SELECT * FROM (SELECT 'WELCOME10' AS code,'신규가입 환영 쿠폰' AS name,'7월 한 달, 신규 가입 시 전 상품 10% 할인' AS description,'PERCENT' AS discount_type,10 AS discount_value,'2026-07-01 00:00:00' AS valid_from,'2026-07-31 23:59:59' AS valid_until,1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM coupon WHERE code = 'WELCOME10');

INSERT INTO coupon (code, name, description, discount_type, discount_value, valid_from, valid_until, is_active)
SELECT * FROM (SELECT 'RETURNING5' AS code,'7월 이벤트 참여 쿠폰' AS name,'7월 한 달, 기존 회원 대상 5% 할인' AS description,'PERCENT' AS discount_type,5 AS discount_value,'2026-07-01 00:00:00' AS valid_from,'2026-07-31 23:59:59' AS valid_until,1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM coupon WHERE code = 'RETURNING5');

-- 이벤트 배너 (가운데 팝업, 클릭 시 회원가입으로 이동)
-- ⚠ 원본은 '/images/events/2026-07-signup-coupon.jpg' 였는데, 그 경로에 해당하는
--    파일이 frontend/public에 실제로 없어서 항상 깨진 이미지였습니다. 실제
--    존재하는 이미지로 바꿨습니다.
INSERT INTO banner (admin_id, title, media_type, banner_type, image_url, link_url, display_order, is_active, start_at, end_at)
SELECT @dc_admin_id, '7월 신규가입 이벤트', 'IMAGE', 'POPUP', 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1200', '/register', 0, 1, '2026-07-01 00:00:00', '2026-07-31 23:59:59'
WHERE @dc_admin_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM banner WHERE title = '7월 신규가입 이벤트');


-- ---------------------------------------------------------
-- 공지사항 — 신규가입 웰컴 쿠폰 안내 (예시)
-- 회원가입 시 WELCOME10을 자동 지급하지 않고, 이 공지를 열람한 뒤
-- [쿠폰받기] 버튼을 눌러야 지급되도록 바뀌었습니다 (notice.coupon_code 참조).
-- ---------------------------------------------------------
INSERT INTO notice (admin_id, title, content, coupon_code, is_pinned, is_active)
SELECT @dc_admin_id, '🎉 회원가입을 환영해요! 10% 할인 쿠폰을 받아가세요',
       '드림컬렉션에 가입해주셔서 감사해요. 아래 [쿠폰받기] 버튼을 누르면 전 상품 10% 할인 쿠폰이 마이페이지 보관함으로 바로 지급돼요. 쿠폰은 1인당 1장만 받을 수 있어요.',
       'WELCOME10', 1, 1
WHERE @dc_admin_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM notice WHERE coupon_code = 'WELCOME10');


-- ════════════════════════════════════════════════════════════════
-- 관리자 권한 부여
-- ⚠ 아래 이메일을 본인 계정으로 바꾼 뒤 마지막에 한 번 실행하세요.
-- ════════════════════════════════════════════════════════════════
 UPDATE users SET role = 'ADMIN' WHERE email = 'dudwo1410@nate.com';
 -- 아래 이메일을 실제 관리자로 만들 계정으로 바꾼 뒤 전체를 한 번에 실행하세요.
-- ⚠ schema.sql을 다시 실행(DROP&CREATE)하면 users/user_badge/saved_trips가
--   전부 초기화되므로, 이 스크립트는 반드시 "schema.sql 실행 이후, 그리고
--   해당 계정으로 회원가입을 마친 다음"에 실행해야 합니다. 순서를 지켰는데도
--   레벨/뱃지가 안 바뀐다면 맨 아래 확인 쿼리에서 @target_id가 NULL로 나오는지
--   확인해보세요 (NULL이면 이메일이 실제 가입 계정과 다른 것입니다).
USE dreamConnection;

SET @target_email = 'dudwo1410@nate.com';  -- ⚠ 여기를 본인 계정 이메일로 바꿔주세요
SET @target_id = (SELECT id FROM users WHERE email = @target_email LIMIT 1);

-- 1) 관리자 권한 부여 → /admin 페이지에서 배너/이달의여행지/메인배경/공지/유저 CRUD 가능해짐
UPDATE users SET role = 'ADMIN' WHERE id = @target_id;

-- 2) 뱃지 도감 전부 지급 (이미 가진 건 건드리지 않음)
INSERT INTO user_badge (user_id, badge_id, earned_at, is_representative)
SELECT @target_id, b.id, NOW(), 0
FROM badge b
WHERE @target_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM user_badge ub WHERE ub.user_id = @target_id AND ub.badge_id = b.id
  );

-- 3) 레벨 최고치로 — 레벨은 saved_trips(여행 저장) 횟수로 계산되므로(LevelPolicy 기준 50회 이상 = Lv.10)
--    더미 저장 기록 50개를 채워넣음. recommendation_json은 그냥 빈 객체로 둠(화면에 안 보임).
--    ⚠ 이전 버전은 재귀 CTE(WITH RECURSIVE)를 썼는데 일부 환경에서 INSERT 안에 끼워 넣는
--      위치 문제로 조용히 실패할 수 있어서, 확실하게 동작하는 UNION ALL 방식으로 바꿨습니다.
INSERT INTO saved_trips (user_id, recommendation_json, created_date)
SELECT * FROM (
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW() UNION ALL
    SELECT @target_id, '{}', NOW()
) AS dummy_trips
WHERE @target_id IS NOT NULL;

-- 확인 (여기서 @target_id가 NULL로 나오면 이메일이 실제 가입 계정과 다른 것입니다)
SELECT @target_id AS resolved_user_id;
SELECT id, email, role FROM users WHERE id = @target_id;
SELECT COUNT(*) AS badge_count FROM user_badge WHERE user_id = @target_id;
SELECT COUNT(*) AS trip_count FROM saved_trips WHERE user_id = @target_id;

USE dreamConnection;
SELECT id, email, role, created_at FROM users;