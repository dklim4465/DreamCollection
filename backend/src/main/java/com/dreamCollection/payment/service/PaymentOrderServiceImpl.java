package com.dreamCollection.payment.service;

import com.dreamCollection.global.exception.BusinessException;
import com.dreamCollection.payment.dto.ConfirmPaymentRequestDTO;
import com.dreamCollection.payment.dto.CreatePaymentOrderRequestDTO;
import com.dreamCollection.payment.dto.PaymentOrderResponseDTO;
import com.dreamCollection.payment.entity.PaymentOrder;
import com.dreamCollection.payment.entity.PaymentOrderStatus;
import com.dreamCollection.payment.exception.PaymentOrderValidator;
import com.dreamCollection.payment.factory.PaymentOrderFactory;
import com.dreamCollection.payment.repository.PaymentOrderRepository;
import com.dreamCollection.trip.entity.SavedTrip;
import com.dreamCollection.trip.repository.SavedTripRepository;
import com.dreamCollection.user.entity.UserPaymentCard;
import com.dreamCollection.user.repository.UserPaymentCardRepository;
import com.dreamCollection.user.service.TossPaymentClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentOrderServiceImpl implements PaymentOrderService {

    private final PaymentOrderRepository paymentOrderRepository;
    private final SavedTripRepository savedTripRepository;
    private final PaymentOrderValidator paymentOrderValidator;
    private final PaymentOrderFactory paymentOrderFactory;
    private final UserPaymentCardRepository userPaymentCardRepository;
    private final TossPaymentClient tossPaymentClient;

    @Override
    @Transactional
    public PaymentOrderResponseDTO createOrder(Long userId, CreatePaymentOrderRequestDTO request) {
        paymentOrderValidator.validateCreate(request);

        SavedTrip savedTrip = savedTripRepository.findByIdAndUserId(request.savedTripId(), userId)
                .orElseThrow(() -> new BusinessException("저장된 일정이 없습니다.", HttpStatus.NOT_FOUND));

        PaymentOrder order = paymentOrderFactory.create(userId, savedTrip, request);
        return PaymentOrderResponseDTO.from(paymentOrderRepository.save(order));
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentOrderResponseDTO getOrder(Long userId, String orderId) {
        PaymentOrder order = paymentOrderRepository.findByOrderIdAndUserId(orderId, userId)
                .orElseThrow(() -> new BusinessException("주문을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        return PaymentOrderResponseDTO.from(order);
    }

    @Override
    @Transactional
    public PaymentOrderResponseDTO confirmOrder(Long userId, String orderId, ConfirmPaymentRequestDTO request) {
        PaymentOrder order = paymentOrderRepository.findByOrderIdAndUserId(orderId, userId)
                .orElseThrow(() -> new BusinessException("주문을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        if (order.getStatus() != PaymentOrderStatus.PENDING) {
            throw new BusinessException("결제할 수 없는 주문 상태입니다.", HttpStatus.BAD_REQUEST);
        }

        UserPaymentCard card = userPaymentCardRepository
                .findByIdAndUserIdAndDeletedAtIsNull(request.cardId(), userId)
                .orElseThrow(() -> new BusinessException("결제 카드를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        String customerKey = "user-" + userId;

        try {
            TossPaymentClient.BillingPayResult result = tossPaymentClient.payWithBillingKey(
                    card.getBillingKey(),
                    customerKey,
                    order.getTotalAmount(),
                    order.getOrderId(),
                    "여행 결제"
            );

            if (result.totalAmount() != order.getTotalAmount()) {
                order.markFailed("결제 금액 불일치", card.getId());
                return PaymentOrderResponseDTO.from(order);
            }

            order.markPaid(result.paymentKey(), card.getId());
            return PaymentOrderResponseDTO.from(order);
        } catch (Exception e) {
            order.markFailed(e.getMessage(), card.getId());
            return PaymentOrderResponseDTO.from(order);
        }
    }
}