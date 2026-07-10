package com.dreamCollection.chat.websocket;

import com.dreamCollection.chat.exception.StompAuthenticationException;
import com.dreamCollection.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

import java.security.Principal;

@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private static final String PREFIX = "Bearer ";

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        // StompHeaderAccessor.wrap(message)는 메시지를 감싸는 "새" accessor를 만들 뿐이라,
        // 여기다 setUser()를 해도 실제 message에는 반영되지 않는 문제가 있었음.
        // StompDecoder가 원본 메시지를 만들 때 쓴 진짜 accessor를 가져와야 수정이 실제로 반영됨.
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = resolveToken(accessor.getFirstNativeHeader("Authorization"));

            if (token == null || !jwtTokenProvider.validateToken(token)) {
                throw new StompAuthenticationException("유효하지 않은 인증 정보입니다.");
            }

            Long userId = jwtTokenProvider.getUserId(token);
            accessor.setUser((Principal) () -> String.valueOf(userId));
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