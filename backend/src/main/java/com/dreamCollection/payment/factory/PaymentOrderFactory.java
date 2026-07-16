package com.dreamCollection.payment.factory;

import com.dreamCollection.accommodation.dto.AccommodationSelectionDTO;
import com.dreamCollection.flight.dto.FlightSelectionDTO;
import com.dreamCollection.global.exception.BusinessException;
import com.dreamCollection.payment.dto.CreatePaymentOrderRequestDTO;
import com.dreamCollection.payment.dto.TravelerRequestDTO;
import com.dreamCollection.payment.entity.PaymentItemType;
import com.dreamCollection.payment.entity.PaymentOrder;
import com.dreamCollection.payment.entity.PaymentOrderItem;
import com.dreamCollection.payment.entity.PaymentTraveler;
import com.dreamCollection.trip.entity.SavedTrip;
import com.dreamCollection.trip.mapper.SavedTripMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class    PaymentOrderFactory {

    private final SavedTripMapper savedTripMapper;

    public PaymentOrder create(Long userId, SavedTrip savedTrip, CreatePaymentOrderRequestDTO request) {
        FlightSelectionDTO flight = savedTripMapper.fromJson(
                savedTrip.getFlightSelectionJson(), FlightSelectionDTO.class);
        AccommodationSelectionDTO hotel = savedTripMapper.fromJson(
                savedTrip.getAccommodationSelectionJson(), AccommodationSelectionDTO.class);

        boolean flightOk = flight != null && !flight.isSkipped() && flight.getPrice() != null;
        boolean hotelOk = hotel != null && !hotel.isSkipped() && hotel.getPrice() != null;
        if (!flightOk && !hotelOk) {
            throw new BusinessException("결제할 항공/숙소가 없습니다.", HttpStatus.BAD_REQUEST);
        }

        PaymentOrder order = PaymentOrder.builder()
                .orderId("ord_" + UUID.randomUUID().toString().replace("-", ""))
                .userId(userId)
                .savedTripId(savedTrip.getId())
                .adultCount(request.adultCount())
                .totalAmount(0)
                .build();

        int total = 0;

        if (flightOk) {
            int unit = toWon(flight.getPrice());
            int qty = request.adultCount();
            int amount = unit * qty;
            order.addItem(PaymentOrderItem.builder()
                    .itemType(PaymentItemType.FLIGHT)
                    .unitPrice(unit)
                    .quantity(qty)
                    .amount(amount)
                    .title(buildFlightTitle(flight))
                    .build());
            total += amount;
        }

        if (hotelOk) {
            int amount = toWon(hotel.getPrice());
            order.addItem(PaymentOrderItem.builder()
                    .itemType(PaymentItemType.HOTEL)
                    .unitPrice(null)
                    .quantity(1)
                    .amount(amount)
                    .title(hotel.getAccommodationName())
                    .build());
            total += amount;
        }

        if (total <= 0) {
            throw new BusinessException("결제 금액이 올바르지 않습니다.", HttpStatus.BAD_REQUEST);
        }

        int sort = 0;
        for (TravelerRequestDTO traveler : request.travelers()) {
            order.addTraveler(toEntity(traveler, sort++));
        }

        order.assignTotalAmount(total);
        return order;
    }

    private static PaymentTraveler toEntity(TravelerRequestDTO traveler, int sortOrder) {
        return PaymentTraveler.builder()
                .fullName(traveler.fullName())
                .birthDate(traveler.birthDate())
                .gender(traveler.gender())
                .passportNumber(traveler.passportNumber())
                .passportExpiry(traveler.passportExpiry())
                .phone(traveler.phone())
                .representative(traveler.representative())
                .sortOrder(sortOrder)
                .build();
    }

    private static int toWon(BigDecimal price) {
        return price.setScale(0, RoundingMode.HALF_UP).intValueExact();
    }

    private static String buildFlightTitle(FlightSelectionDTO flight) {
        if (flight.getOutboundFlight() == null) {
            return "항공";
        }
        return flight.getOutboundFlight().getDepartureAirportCode()
                + " → "
                + flight.getOutboundFlight().getArrivalAirportCode();
    }
}