// 파일: src/main/java/com/dreamCollection/chat/websocket/StompAuthChannelInterceptor.java
package com.dreamCollection.chat.websocket;

import com.dreamCollection.chat.exception.StompAuthenticationException;
import com.dreamCollection.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.security.Principal;

@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private static final String PREFIX = "Bearer ";

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = resolveToken(accessor.getFirstNativeHeader("Authorization"));

            if (token == null || !jwtTokenProvider.validateToken(token)) {
                throw new StompAuthenticationException("유효하지 않은 인증 정보입니다.");
            }

            Long userId = jwtTokenProvider.getUserId(token);
            accessor.setUser(() -> String.valueOf(userId));
        }

        return message;
    }

    private String resolveToken(String header) {
        if (header != null && header.startsWith(PREFIX)) {
            return header.substring(PREFIX.length());
        }
        return null;
    }
}