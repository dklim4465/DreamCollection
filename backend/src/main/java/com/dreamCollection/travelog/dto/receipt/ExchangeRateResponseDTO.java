package com.dreamCollection.travelog.dto.receipt;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public record ExchangeRateResponseDTO(
        LocalDate date,
        String base,
        String quote,
        BigDecimal rate
) {
}
