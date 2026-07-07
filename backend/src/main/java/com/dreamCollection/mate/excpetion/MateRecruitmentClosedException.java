package com.dreamCollection.mate.excpetion;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class MateRecruitmentClosedException extends BusinessException {
    public MateRecruitmentClosedException() {
        super("모집이 마감된 게시글입니다.", HttpStatus.CONFLICT);
    }
}