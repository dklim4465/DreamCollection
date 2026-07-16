package com.dreamCollection.payment.exception;

import com.dreamCollection.global.exception.BusinessException;
import com.dreamCollection.payment.dto.CreatePaymentOrderRequestDTO;
import com.dreamCollection.payment.dto.TravelerRequestDTO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class PaymentOrderValidator {

    public void validateCreate(CreatePaymentOrderRequestDTO request) {
        if (request.travelers().size() != request.adultCount()) {
            throw new BusinessException("여행자 수는 인원수와 같아야 합니다.", HttpStatus.BAD_REQUEST);
        }

        long repCount = request.travelers().stream()
                .filter(TravelerRequestDTO::representative)
                .count();
        if (repCount != 1) {
            throw new BusinessException("대표 여행자는 정확히 1명이어야 합니다.", HttpStatus.BAD_REQUEST);
        }

        TravelerRequestDTO representative = request.travelers().stream()
                .filter(TravelerRequestDTO::representative)
                .findFirst()
                .orElseThrow();
        if (representative.phone() == null || representative.phone().isBlank()) {
            throw new BusinessException("대표 여행자 연락처가 필요합니다.", HttpStatus.BAD_REQUEST);
        }
    }
}