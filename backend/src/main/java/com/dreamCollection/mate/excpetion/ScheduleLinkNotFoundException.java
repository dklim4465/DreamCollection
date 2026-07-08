package com.dreamCollection.mate.excpetion;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class ScheduleLinkNotFoundException extends BusinessException {
    public ScheduleLinkNotFoundException(){
        super("일정 정보를 연동할 수 없습니다.", HttpStatus.NOT_FOUND);
    }
}
