package com.dreamcollection.global.exception;

import org.springframework.http.HttpStatus;

public class AccountNotActiveException extends BusinessException {
    public AccountNotActiveException(String reason) {
        super(reason, HttpStatus.FORBIDDEN);
    }
}
