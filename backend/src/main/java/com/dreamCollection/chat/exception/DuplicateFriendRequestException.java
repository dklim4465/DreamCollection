package com.dreamCollection.chat.exception;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class DuplicateFriendRequestException extends BusinessException {
    public DuplicateFriendRequestException(){
        super("이미 친구이거나 요청을 보낸 상대입니다.", HttpStatus.CONFLICT);
    }
}
