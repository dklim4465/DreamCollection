package com.dreamCollection.travelog.service;

import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;

@Transactional
public interface ExchangeRateService {

    BigDecimal getRate(String currency, Instant paidAt);
}
