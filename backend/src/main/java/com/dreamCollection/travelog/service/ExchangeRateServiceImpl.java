package com.dreamCollection.travelog.service;

import com.dreamCollection.travelog.dto.receipt.ExchangeRateResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

@Service
@RequiredArgsConstructor
@Log4j2
public class ExchangeRateServiceImpl implements ExchangeRateService {

    private final RestClient exchangeRateClient;

    @Override
    public BigDecimal getRate(String currency, Instant paidAt) {

        if ("KRW".equalsIgnoreCase(currency)) {
            return BigDecimal.ONE;
        }

        LocalDate date = paidAt.atZone(ZoneOffset.UTC).toLocalDate();

        ExchangeRateResponseDTO response = exchangeRateClient.get()
                .uri(uriBuilder -> uriBuilder.path("/v2/rate/{base}/{quote}")
                        .queryParam("date", date)
                        .build(currency, "KRW"))
                .retrieve()
                .body(ExchangeRateResponseDTO.class);

        if (response == null || response.rate() == null) {
            throw new IllegalStateException("환율 조회 실패");
        }

        return response.rate();
    }
}
