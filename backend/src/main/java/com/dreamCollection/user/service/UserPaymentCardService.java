package com.dreamCollection.user.service;

import com.dreamCollection.user.dto.PaymentCardResponse;
import com.dreamCollection.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import com.dreamCollection.user.entity.UserPaymentCard;
import com.dreamCollection.user.repository.UserPaymentCardRepository;

@Service
@RequiredArgsConstructor
public class UserPaymentCardService {

    private final UserPaymentCardRepository userPaymentCardRepository;
    private final TossPaymentClient tossPaymentClient;

    @Transactional
    public PaymentCardResponse registerCard(Long userId, String authKey, String customerKey) {
        // customerKey는 프론트가 위젯 실행 시 넘긴 값 — 로그인한 본인 카드가 맞는지 대조
        if (!customerKey.equals(String.valueOf(userId))) {
            throw new BusinessException("본인 명의로만 카드를 등록할 수 있습니다.", HttpStatus.FORBIDDEN);
        }

        TossPaymentClient.BillingKeyResult result = tossPaymentClient.issueBillingKey(authKey, customerKey);

        boolean isFirstCard = userPaymentCardRepository.findByUserIdAndDeletedAtIsNull(userId).isEmpty();

        UserPaymentCard card = UserPaymentCard.builder()
                .userId(userId)
                .cardCompany(result.cardCompany())
                .cardLast4(result.cardLast4())
                .billingKey(result.billingKey())
                .build();

        UserPaymentCard saved = userPaymentCardRepository.save(card);
        return PaymentCardResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<PaymentCardResponse> getMyCards(Long userId) {
        return userPaymentCardRepository.findByUserIdAndDeletedAtIsNull(userId).stream()
                .map(PaymentCardResponse::from)
                .toList();
    }
}