package com.dreamCollection.global.exception;

import org.springframework.http.HttpStatus;

public class DuplicatePhoneException extends BusinessException {
    public DuplicatePhoneException() {
        super("이미 가입된 휴대폰 번호입니다.", HttpStatus.CONFLICT);
    }
}
