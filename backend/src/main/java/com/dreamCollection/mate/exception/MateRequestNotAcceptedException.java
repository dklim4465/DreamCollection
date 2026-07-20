package com.dreamCollection.mate.exception;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class MateRequestNotAcceptedException extends BusinessException {
    public MateRequestNotAcceptedException() {
        super("수락된 신청만 일정에 연동할 수 있습니다.", HttpStatus.BAD_REQUEST);
    }
}