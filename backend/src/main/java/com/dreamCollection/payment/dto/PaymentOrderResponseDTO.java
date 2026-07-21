package com.dreamCollection.payment.dto;

import com.dreamCollection.payment.entity.PaymentOrder;
import com.dreamCollection.payment.entity.PaymentOrderItem;
import com.dreamCollection.payment.entity.PaymentTraveler;

import java.util.List;

public record PaymentOrderResponseDTO(
        String orderId,
        Long savedTripId,
        int adultCount,
        int totalAmount,
        String status,
        String paymentKey,
        Long cardId,
        String failReason,
        String paidAt,
        List<ItemResponseDTO> items,
        List<TravelerResponseDTO> travelers
) {
    public static PaymentOrderResponseDTO from(PaymentOrder order) {
        return new PaymentOrderResponseDTO(
                order.getOrderId(),
                order.getSavedTripId(),
                order.getAdultCount(),
                order.getTotalAmount(),
                order.getStatus().name(),
                order.getPaymentKey(),
                order.getCardId(),
                order.getFailReason(),
                order.getPaidAt() != null ? order.getPaidAt().toString() : null,
                order.getItems().stream().map(ItemResponseDTO::from).toList(),
                order.getTravelers().stream().map(TravelerResponseDTO::from).toList()
        );
    }

    public record ItemResponseDTO(String itemType, Integer unitPrice, Integer quantity, int amount, String title) {
        static ItemResponseDTO from(PaymentOrderItem item) {
            return new ItemResponseDTO(
                    item.getItemType().name(),
                    item.getUnitPrice(),
                    item.getQuantity(),
                    item.getAmount(),
                    item.getTitle()
            );
        }
    }

    public record TravelerResponseDTO(
            String fullName, String birthDate, String gender,
            String passportNumber, String passportExpiry,
            String nationality, String phone, boolean representative
    ) {
        static TravelerResponseDTO from(PaymentTraveler t) {
            return new TravelerResponseDTO(
                    t.getFullName(),
                    t.getBirthDate().toString(),
                    t.getGender(),
                    t.getPassportNumber(),
                    t.getPassportExpiry().toString(),
                    t.getNationality(),
                    t.getPhone(),
                    t.isRepresentative()
            );
        }
    }
}