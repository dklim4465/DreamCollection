package com.dreamCollection.trip.exception;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class TripRecommendFailedException extends BusinessException {
    public TripRecommendFailedException() {
        super("일정 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.", HttpStatus.BAD_GATEWAY);
    }
}