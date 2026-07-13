package com.dreamCollection.chat.exception;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class SelfFriendRequestException extends BusinessException {
    public SelfFriendRequestException() {
        super("자기 자신에게 친구 요청을 보낼 수 없습니다.", HttpStatus.BAD_REQUEST);
    }
}