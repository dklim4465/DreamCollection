package com.dreamCollection.mate.exception;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class DuplicateScheduleLinkException extends BusinessException {
    public DuplicateScheduleLinkException(){
        super("이미 일저에 연동된 신청입니다.", HttpStatus.CONFLICT);
    }
}
