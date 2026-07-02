package com.backend.global.exception;

import org.springframework.http.HttpStatus;

public class DuplicateEmailException extends BusinessException {
    public DuplicateEmailException() {
        super("?´ë? ê°€?…ëœ ?´ë©”?¼ì…?ˆë‹¤.", HttpStatus.CONFLICT);
    }
}
