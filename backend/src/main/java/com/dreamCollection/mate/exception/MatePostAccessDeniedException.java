package com.dreamCollection.mate.exception;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class MatePostAccessDeniedException extends BusinessException {
    public MatePostAccessDeniedException(){
        super("모집글 작성자만 수정/삭제할 수 있습니다.", HttpStatus.FORBIDDEN);
    }
}