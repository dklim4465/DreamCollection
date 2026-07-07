package com.dreamCollection.auth.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

/**
 * 카카오 로그인(인가 코드 방식) 연동.
 *
 * 사용 전 준비물:
 * 1) https://developers.kakao.com 에서 애플리케이션 생성
 * 2) [카카오 로그인] 활성화, Redirect URI 등록 (프론트 콜백 주소, 예: http://localhost:3000/oauth/callback/kakao)
 * 3) [카카오 로그인 > 동의항목]에서 닉네임/프로필사진/카카오계정(이메일) 동의 항목 설정
 * 4) 앱 키 중 REST API 키를 application.yml / .env 의 KAKAO_CLIENT_ID 에 입력
 *
 * 흐름: 프론트가 카카오 로그인 페이지로 리다이렉트 → 사용자 동의 → 카카오가 프론트 콜백으로 code 전달
 *      → 프론트가 그 code를 백엔드로 전달 → 백엔드가 이 클래스로 code를 access token으로 교환 → 프로필 조회
 */
@Slf4j
@Component
public class KakaoOauthClient {

    private static final String TOKEN_URL = "https://kauth.kakao.com/oauth/token";
    private static final String USER_INFO_URL = "https://kapi.kakao.com/v2/user/me";

    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${oauth.kakao.client-id}")
    private String clientId;

    @Value("${oauth.kakao.client-secret:}")
    private String clientSecret;

    @Value("${oauth.kakao.redirect-uri}")
    private String redirectUri;

    public record KakaoUserInfo(String providerUserId, String email, String nickname, String profileImageUrl) {
    }

    public KakaoUserInfo getUserInfo(String code) {
        String accessToken = exchangeCodeForAccessToken(code);
        return fetchUserInfo(accessToken);
    }

    private String exchangeCodeForAccessToken(String code) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("client_id", clientId);
        form.add("redirect_uri", redirectUri);
        form.add("code", code);
        if (clientSecret != null && !clientSecret.isBlank()) {
            form.add("client_secret", clientSecret);
        }

        String response = restClient.post()
                .uri(TOKEN_URL)
                .header("Content-Type", "application/x-www-form-urlencoded;charset=utf-8")
                .body(form)
                .retrieve()
                .body(String.class);

        try {
            JsonNode node = objectMapper.readTree(response);
            return node.get("access_token").asText();
        } catch (Exception e) {
            throw new IllegalStateException("카카오 토큰 교환 응답 파싱 실패", e);
        }
    }

    private KakaoUserInfo fetchUserInfo(String accessToken) {
        String response = restClient.get()
                .uri(USER_INFO_URL)
                .header("Authorization", "Bearer " + accessToken)
                .header("Content-Type", "application/x-www-form-urlencoded;charset=utf-8")
                .retrieve()
                .body(String.class);

        try {
            JsonNode node = objectMapper.readTree(response);
            String providerUserId = node.get("id").asText();

            JsonNode kakaoAccount = node.path("kakao_account");
            JsonNode profile = kakaoAccount.path("profile");

            // 이메일 동의를 안 했거나 이메일이 없는 카카오 계정일 수 있음 → 없으면 임시 이메일 생성
            String email = kakaoAccount.path("email").isMissingNode()
                    ? "kakao_" + providerUserId + "@kakao.dreamCollection.local"
                    : kakaoAccount.path("email").asText();

            String nickname = profile.path("nickname").asText("카카오사용자" + providerUserId);
            String profileImageUrl = profile.path("profile_image_url").asText(null);

            return new KakaoUserInfo(providerUserId, email, nickname, profileImageUrl);
        } catch (Exception e) {
            throw new IllegalStateException("카카오 프로필 응답 파싱 실패", e);
        }
    }
}