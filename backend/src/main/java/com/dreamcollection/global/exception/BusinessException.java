package com.dreamcollection.global.exception;

import org.springframework.http.HttpStatus;

/**
 * 비즈니스 로직에서 의도적으로 던지는 예외의 기반 클래스
 */
public class BusinessException extends RuntimeException {

    private final HttpStatus httpStatus;

    public BusinessException(String message, HttpStatus httpStatus) {
        super(message);
        this.httpStatus = httpStatus;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
