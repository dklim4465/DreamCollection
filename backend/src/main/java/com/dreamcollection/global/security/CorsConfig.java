package com.dreamcollection.global.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * 프론트엔드(Vite 개발서버 등)에서 이 백엔드 API를 호출할 수 있게 허용하는 설정.
 * 배포 시에는 allowed-origins에 실제 프론트 도메인을 추가해야 함.
 */
@Configuration
public class CorsConfig {

    // application.yml의 cors.allowed-origins 값으로 관리 (콤마로 여러 개 구분 가능)
    @Value("#{'${cors.allowed-origins:http://localhost:5173,http://localhost:3000}'.split(',')}")
    private List<String> allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true); // 쿠키/Authorization 헤더 포함 요청 허용
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
