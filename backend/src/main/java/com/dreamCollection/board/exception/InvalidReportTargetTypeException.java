package com.dreamCollection.board.exception;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class InvalidReportTargetTypeException extends BusinessException {
    public InvalidReportTargetTypeException() {
        super("신고 대상 유형은 POST, COMMENT, USER 중 하나여야 합니다.", HttpStatus.BAD_REQUEST);
    }
}