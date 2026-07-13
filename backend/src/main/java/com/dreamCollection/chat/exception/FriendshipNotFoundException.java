package com.dreamCollection.chat.exception;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class FriendshipNotFoundException extends BusinessException {
    public FriendshipNotFoundException(){
        super("친구 요청을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
    }
}
