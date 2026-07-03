package com.dreamcollection.global.exception;

import org.springframework.http.HttpStatus;

public class DuplicateEmailException extends BusinessException {
    public DuplicateEmailException() {
        super("이미 가입된 이메일입니다.", HttpStatus.CONFLICT);
    }
}
