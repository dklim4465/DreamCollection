-- ════════════════════════════════════════════════════════════════
-- 이달의 여행지 / 배너 / 쿠폰 / 공지 다시 채우기 (테이블 DROP 없이, 안전하게 재실행 가능)
--
-- 언제 필요한가요?
--  schema.sql을 맨 처음 실행할 때 users 테이블에 계정이 하나도 없으면,
--  아래 admin_id 조회가 NULL이 되어서 이달의 여행지/배너/공지 INSERT가
--  전부 조용히 스킵됩니다 ("WHERE @dc_admin_id IS NOT NULL" 가드 때문).
--  → 그래서 회원가입 이후에도 홈 화면 배너/이달의 추천 여행지가 계속 비어 보였던 것입니다.
--
-- 사용법: 먼저 사이트에서 회원가입을 1명 이상 한 뒤, 이 파일만 실행하세요.
-- (USE dreamConnection; 은 알아서 되어 있다는 가정 하에 아래부터 실행해도 됩니다)
-- 전부 NOT EXISTS로 감싸져 있어서 여러 번 실행해도 중복 데이터가 쌓이지 않습니다.
-- ════════════════════════════════════════════════════════════════

USE dreamConnection;

-- 관리자 콘텐츠 시드 (이달의 여행지 / 배너)
-- admin_id 는 dudwo1410@nate.com 계정을 우선 사용하고,
-- 없으면 가장 먼저 가입한 사용자를 임시 관리자로 사용합니다.
-- ---------------------------------------------------------
SET @dc_admin_id = (SELECT id FROM users WHERE email = 'dudwo1410@nate.com' LIMIT 1);
SET @dc_admin_id = COALESCE(@dc_admin_id, (SELECT id FROM users ORDER BY id LIMIT 1));

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
-- ⚠ 원본은 media_type='VIDEO' + '/uploads/videos/main-banner.mp4' 였는데,
--    FileStorageService는 이미지만 저장하고(videos 폴더 자체가 없음) 그 파일이
--    실제로 존재한 적이 없어서 항상 깨진 채로 보였습니다. 실제로 존재하는
--    이미지로 바꿨습니다. 진짜 홍보 영상을 쓰고 싶으면 관리자 페이지에서
--    영상을 올린 뒤 그 URL로 UPDATE 해주세요.
INSERT INTO banner (admin_id, title, media_type, banner_type, image_url, link_url, display_order, is_active, created_at, updated_at)
SELECT @dc_admin_id, '대표 홍보 영상', 'IMAGE', 'CORNER_AD', 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800', NULL, 0, 1, NOW(), NOW()
WHERE @dc_admin_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM banner WHERE title = '대표 홍보 영상');


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
