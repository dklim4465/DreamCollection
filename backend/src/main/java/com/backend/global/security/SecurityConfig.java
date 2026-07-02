package com.backend.global.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * ì§€ê¸ˆì? ?Œì›ê°€?…ì— ?„ìš”??PasswordEncoderë§??±ë¡?©ë‹ˆ??
 * TODO: JWT ?¸ì¦ ?„í„°, SecurityFilterChain ???„ì²´ Security ?¤ì •?€
 *       ë¡œê·¸??API ?‘ì—… ?????´ë˜?¤ì— ?´ì–´??ì±„ì›Œì£¼ì„¸??
 */
@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
