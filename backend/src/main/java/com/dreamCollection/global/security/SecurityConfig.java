package com.dreamCollection.global.security;

import com.dreamCollection.global.response.AccessDeniedHandlerImpl;
import com.dreamCollection.global.response.AuthEntryPointHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * JWT 기반 Stateless 인증 설정.
 *
 * 공개(누구나 접근 가능) API:
 *  - /api/auth/**        회원가입/로그인/인증코드 발송·확인
 *  - /api/cities/**       도시 자동완성 검색
 *  - /api/banners, /api/notices, /api/main/**   메인페이지 조회성 API
 *
 * 관리자 전용 API:
 *  - /api/admin/**       배너/메인배경/공지사항/이달의여행지/회원관리 (Role.ADMIN 필요)
 *
 * 그 외 API는 전부 로그인(JWT) 필요.
 * 담당 도메인에서 공개로 열어야 하는 GET API가 있으면 이 목록에 추가하면 됩니다.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthEntryPointHandler authEntryPointHandler;
    private final AccessDeniedHandlerImpl accessDeniedHandler;
    private final CorsConfigurationSource corsConfigurationSource;

    private static final String[] PUBLIC_URLS = {
            "/api/auth/**",
            "/api/cities/**",
            "/api/banners/**",
            "/api/notices/**",
            "/api/main/**",
            "/api/images/**",
            "/api/stats/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**"
    };

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // REST API는 세션을 안 쓰므로 CSRF 보호 불필요 (토큰 자체가 위조 방지 역할)
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authEntryPointHandler)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_URLS).permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}