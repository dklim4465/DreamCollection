package com.dreamCollection.payment.service;

import com.dreamCollection.payment.dto.ConfirmPaymentRequestDTO;
import com.dreamCollection.payment.dto.CreatePaymentOrderRequestDTO;
import com.dreamCollection.payment.dto.PaymentOrderResponseDTO;

import java.util.List;

public interface PaymentOrderService {

    PaymentOrderResponseDTO createOrder(Long userId, CreatePaymentOrderRequestDTO request);

    PaymentOrderResponseDTO getOrder(Long userId, String orderId);

    PaymentOrderResponseDTO confirmOrder(Long userId, String orderId, ConfirmPaymentRequestDTO request);

    List<PaymentOrderResponseDTO> getMyOrders(Long userId);
}