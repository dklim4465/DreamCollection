package com.dreamCollection.board.exception;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class DuplicateReportException extends BusinessException {
    public DuplicateReportException(){
        super("이미 신고한 대상입니다.", HttpStatus.CONFLICT);
    }
}
