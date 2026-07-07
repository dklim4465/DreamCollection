package com.dreamCollection.global.exception;

import org.springframework.http.HttpStatus;

public class InvalidVerificationCodeException extends BusinessException {
    public InvalidVerificationCodeException() {
        super("인증번호가 올바르지 않거나 만료되었습니다.", HttpStatus.BAD_REQUEST);
    }
}
