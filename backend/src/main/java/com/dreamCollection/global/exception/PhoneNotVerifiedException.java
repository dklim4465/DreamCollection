package com.dreamCollection.global.exception;

import org.springframework.http.HttpStatus;

public class PhoneNotVerifiedException extends BusinessException {
    public PhoneNotVerifiedException() {
        super("휴대폰 인증이 완료되지 않았습니다.", HttpStatus.BAD_REQUEST);
    }
}
