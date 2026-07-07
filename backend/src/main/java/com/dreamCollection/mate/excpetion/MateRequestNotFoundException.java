package com.dreamCollection.mate.excpetion;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class MateRequestNotFoundException extends BusinessException {
    public MateRequestNotFoundException(){
        super("신청 내역을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
    }
}