package com.backend.global.exception;

import org.springframework.http.HttpStatus;

/**
 * ë¹„ì¦ˆ?ˆìŠ¤ ë¡œì§?ì„œ ?˜ë„?ìœ¼ë¡??˜ì????ˆì™¸??ê¸°ë°˜ ?´ë˜??
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
