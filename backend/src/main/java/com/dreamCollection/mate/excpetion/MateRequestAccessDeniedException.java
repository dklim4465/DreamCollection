package com.dreamCollection.mate.excpetion;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class MateRequestAccessDeniedException extends BusinessException {
    public MateRequestAccessDeniedException(){
        super("모집글 작성자만 신청을 수락/거절할 수 있습니다.", HttpStatus.FORBIDDEN);
    }
}
