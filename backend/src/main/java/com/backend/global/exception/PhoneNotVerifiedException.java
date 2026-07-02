package com.backend.global.exception;

import org.springframework.http.HttpStatus;

public class PhoneNotVerifiedException extends BusinessException {
    public PhoneNotVerifiedException() {
        super("?´ë????¸ì¦???„ë£Œ?˜ì? ?Šì•˜?µë‹ˆ??", HttpStatus.BAD_REQUEST);
    }
}
