package com.dreamCollection.chat.exception;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class ChatRoomAccessDeniedException extends BusinessException {
    public ChatRoomAccessDeniedException(){
        super("채팅방에 참여한 사용자만 접근할 수 있습니다.", HttpStatus.FORBIDDEN);
    }
}
