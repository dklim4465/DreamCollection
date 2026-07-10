package com.dreamCollection.global.exception;

import org.springframework.http.HttpStatus;

public class UserNotFoundException extends BusinessException {
    public UserNotFoundException() {
        super("가입되지 않은 회원입니다.", HttpStatus.NOT_FOUND);
    }
}
