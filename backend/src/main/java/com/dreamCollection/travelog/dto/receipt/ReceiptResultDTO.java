package com.dreamCollection.travelog.dto.receipt;

import java.time.LocalDateTime;

public record ReceiptResultDTO(
        Long mno,
        String merchant,
        String paidAt,
        Long totalAmount,
        String currency,
        String ocrText,
        float confidence
) {
}
