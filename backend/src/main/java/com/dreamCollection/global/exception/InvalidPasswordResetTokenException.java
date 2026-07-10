package com.dreamCollection.global.exception;

import org.springframework.http.HttpStatus;

public class InvalidPasswordResetTokenException extends BusinessException {
    public InvalidPasswordResetTokenException() {
        super("비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다. 다시 시도해주세요.", HttpStatus.BAD_REQUEST);
    }
}
