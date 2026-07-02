package com.backend.global.exception;

import org.springframework.http.HttpStatus;

public class InvalidVerificationCodeException extends BusinessException {
    public InvalidVerificationCodeException() {
        super("?¸ì¦ë²ˆí˜¸ê°€ ?¬ë°”ë¥´ì? ?Šê±°??ë§Œë£Œ?˜ì—ˆ?µë‹ˆ??", HttpStatus.BAD_REQUEST);
    }
}
