package com.dreamCollection.user.service;

import com.dreamCollection.user.dto.PaymentCardResponse;
import com.dreamCollection.global.exception.BusinessException;
import com.dreamCollection.global.exception.PaymentCardNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
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
    if (!customerKey.equals("user-" + userId)) {
        throw new BusinessException("본인 명의로만 카드를 등록할 수 있습니다.", HttpStatus.FORBIDDEN);
    }

        TossPaymentClient.BillingKeyResult result = tossPaymentClient.issueBillingKey(authKey, customerKey);

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

    /**
     * 마이페이지 "결제수단 삭제" (soft delete).
     * 삭제한 카드가 기본카드였다면, 남은 카드 중 가장 먼저 등록한 카드를 새 기본카드로 자동 승격한다.
     */
    @Transactional
    public void deleteCard(Long userId, Long cardId) {
        UserPaymentCard card = userPaymentCardRepository.findByIdAndUserIdAndDeletedAtIsNull(cardId, userId)
                .orElseThrow(PaymentCardNotFoundException::new);

        boolean wasDefault = card.isDefault();
        card.softDelete();

        if (wasDefault) {
            userPaymentCardRepository.findByUserIdAndDeletedAtIsNull(userId).stream()
                    .min(Comparator.comparing(UserPaymentCard::getCreatedAt))
                    .ifPresent(UserPaymentCard::markAsDefault);
        }
    }

    /** 마이페이지 "기본 결제수단으로 변경" — 기존 기본카드는 해제하고, 선택한 카드만 기본으로 표시 */
    @Transactional
    public void setDefaultCard(Long userId, Long cardId) {
        UserPaymentCard target = userPaymentCardRepository.findByIdAndUserIdAndDeletedAtIsNull(cardId, userId)
                .orElseThrow(PaymentCardNotFoundException::new);

        if (target.isDefault()) {
            return; // 이미 기본카드면 아무것도 할 필요 없음
        }

        userPaymentCardRepository.findByUserIdAndDeletedAtIsNull(userId).stream()
                .filter(UserPaymentCard::isDefault)
                .forEach(UserPaymentCard::unmarkAsDefault);

        target.markAsDefault();
    }
}