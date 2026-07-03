package com.dreamcollection.domain.user.dto;

import com.dreamcollection.domain.user.entity.UserPaymentCard;

import java.time.LocalDateTime;

public record PaymentCardResponse(
        Long id,
        String cardCompany,
        String cardLast4,
        boolean isDefault,
        LocalDateTime createdAt
) {
    public static PaymentCardResponse from(UserPaymentCard card) {
        return new PaymentCardResponse(
                card.getId(), card.getCardCompany(), card.getCardLast4(),
                card.isDefault(), card.getCreatedAt()
        );
    }
}