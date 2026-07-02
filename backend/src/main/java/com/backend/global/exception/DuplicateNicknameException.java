package com.backend.global.exception;

import org.springframework.http.HttpStatus;

public class DuplicateNicknameException extends BusinessException {
    public DuplicateNicknameException() {
        super("?´ë? ?¬ìš© ì¤‘ì¸ ?‰ë„¤?„ì…?ˆë‹¤.", HttpStatus.CONFLICT);
    }
}
