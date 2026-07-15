package com.dreamCollection.chat.exception;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class ChatRoomNotFoundException extends BusinessException {
    public ChatRoomNotFoundException(){
        super("채팅방을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
    }
}
