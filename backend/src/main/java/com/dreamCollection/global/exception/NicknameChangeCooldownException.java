package com.dreamCollection.global.exception;

import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class NicknameChangeCooldownException extends BusinessException {
    public NicknameChangeCooldownException(LocalDateTime availableAt) {
        super("닉네임은 2주에 한 번만 바꿀 수 있어요. "
                        + availableAt.format(DateTimeFormatter.ofPattern("MM월 dd일 HH시"))
                        + " 이후에 다시 시도해주세요.",
                HttpStatus.CONFLICT);
    }
}