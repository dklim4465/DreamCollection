package com.dreamCollection.global.exception;

import org.springframework.http.HttpStatus;

public class PaymentCardNotFoundException extends BusinessException {
    public PaymentCardNotFoundException() {
        super("등록된 결제수단을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
    }
}
