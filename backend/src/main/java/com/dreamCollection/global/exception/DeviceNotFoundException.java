package com.dreamCollection.global.exception;

import org.springframework.http.HttpStatus;

public class DeviceNotFoundException extends BusinessException {
    public DeviceNotFoundException() {
        super("해당 로그인 기기를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
    }
}
