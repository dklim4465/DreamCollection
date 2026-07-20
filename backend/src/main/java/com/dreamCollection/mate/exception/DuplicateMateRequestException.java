package com.dreamCollection.mate.exception;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class DuplicateMateRequestException extends BusinessException {
    public DuplicateMateRequestException() {
        super("이미 신청한 모집글입니다.", HttpStatus.CONFLICT);
    }
}
