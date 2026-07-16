package com.dreamCollection.payment.dto;

import jakarta.validation.constraints.NotNull;

public record ConfirmPaymentRequestDTO(
        @NotNull Long cardId
) {}