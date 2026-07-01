package com.dreamcollection.global.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * 지금은 회원가입에 필요한 PasswordEncoder만 등록합니다.
 * TODO: JWT 인증 필터, SecurityFilterChain 등 전체 Security 설정은
 *       로그인 API 작업 시 이 클래스에 이어서 채워주세요.
 */
@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
