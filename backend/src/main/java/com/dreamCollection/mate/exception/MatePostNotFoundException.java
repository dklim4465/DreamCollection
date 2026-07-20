package com.dreamCollection.mate.exception;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class MatePostNotFoundException extends BusinessException {
    public MatePostNotFoundException(){
    super("모집글을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
}
}