package com.dreamCollection.payment.controller;

import com.dreamCollection.global.response.ApiResponse;
import com.dreamCollection.payment.dto.ConfirmPaymentRequestDTO;
import com.dreamCollection.payment.dto.CreatePaymentOrderRequestDTO;
import com.dreamCollection.payment.dto.PaymentOrderResponseDTO;
import com.dreamCollection.payment.service.PaymentOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments/orders")
@RequiredArgsConstructor
public class PaymentOrderController {

    private final PaymentOrderService paymentOrderService;

    @PostMapping
    public ApiResponse<PaymentOrderResponseDTO> create(@Valid @RequestBody CreatePaymentOrderRequestDTO request, Authentication authentication){
        Long userId = (Long) authentication.getPrincipal();
        return ApiResponse.ok(paymentOrderService.createOrder(userId, request), "주문이 생성되었습니다.");
    }

    @GetMapping("/{orderId}")
    public ApiResponse<PaymentOrderResponseDTO> get(@PathVariable String orderId, Authentication authentication){
        Long userId = (Long) authentication.getPrincipal();
        return ApiResponse.ok(paymentOrderService.getOrder(userId,orderId));
    }

    @PostMapping("/{orderId}/confirm")
    public ApiResponse<PaymentOrderResponseDTO> confirm(
            @PathVariable String orderId,
            @Valid @RequestBody ConfirmPaymentRequestDTO request,
            Authentication authentication
    ) {
        Long userId = (Long) authentication.getPrincipal();
        return ApiResponse.ok(
                paymentOrderService.confirmOrder(userId, orderId, request),
                "결제가 완료되었습니다."
        );
    }

}
