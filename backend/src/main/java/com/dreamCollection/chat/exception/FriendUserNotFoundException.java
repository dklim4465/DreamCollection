package com.dreamCollection.chat.exception;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class FriendUserNotFoundException extends BusinessException {
    public FriendUserNotFoundException(){
        super("사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
    }
}
