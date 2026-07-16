package com.dreamCollection.payment;

import com.dreamCollection.payment.dto.CreatePaymentOrderRequestDTO;
import com.dreamCollection.payment.dto.PaymentOrderResponseDTO;
import com.dreamCollection.payment.dto.TravelerRequestDTO;
import com.dreamCollection.payment.service.PaymentOrderService;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Log4j2
public class PaymentServiceTests {

    /** 실제 DB users.id / saved_trips.id 로 교체 */
    private static final Long USER_ID = 1L;
    private static final Long SAVED_TRIP_ID = 5L;

    @Autowired
    private PaymentOrderService paymentOrderService;

    @Test
    void createPendingOrder() {
        CreatePaymentOrderRequestDTO request = new CreatePaymentOrderRequestDTO(
                SAVED_TRIP_ID,
                2,
                List.of(
                        new TravelerRequestDTO(
                                "홍길동",
                                LocalDate.of(1995, 1, 1),
                                "M",
                                "M12345678",
                                LocalDate.of(2030, 12, 31),
                                "01012345678",
                                true
                        ),
                        new TravelerRequestDTO(
                                "김영희",
                                LocalDate.of(1996, 2, 2),
                                "F",
                                "M87654321",
                                LocalDate.of(2031, 1, 15),
                                null,
                                false
                        )

                )
        );

        PaymentOrderResponseDTO response = paymentOrderService.createOrder(USER_ID, request);

        log.info("orderId = {}", response.orderId());
        log.info("totalAmount = {}", response.totalAmount());
        log.info("status = {}", response.status());
        log.info("items = {}", response.items());
        log.info("travelers = {}", response.travelers());

        assertNotNull(response.orderId());
        assertEquals("PENDING", response.status());
        assertEquals(2, response.adultCount());
        assertTrue(response.totalAmount() > 0);
        assertFalse(response.items().isEmpty());
        assertEquals(2, response.travelers().size());
    }

    @Test
    void getOrderAfterCreate() {
        CreatePaymentOrderRequestDTO request = new CreatePaymentOrderRequestDTO(
                SAVED_TRIP_ID,
                1,
                List.of(
                        new TravelerRequestDTO(
                                "홍길동",
                                LocalDate.of(1995, 1, 1),
                                "M",
                                "M12345678",
                                LocalDate.of(2030, 12, 31),
                                "01012345678",
                                true
                        )
                )
        );

        PaymentOrderResponseDTO created = paymentOrderService.createOrder(USER_ID, request);
        PaymentOrderResponseDTO found = paymentOrderService.getOrder(USER_ID, created.orderId());

        assertEquals(created.orderId(), found.orderId());
        assertEquals(created.totalAmount(), found.totalAmount());
    }

    @Test
    void rejectWhenTravelerCountMismatch() {
        CreatePaymentOrderRequestDTO request = new CreatePaymentOrderRequestDTO(
                SAVED_TRIP_ID,
                2,
                List.of(
                        new TravelerRequestDTO(
                                "홍길동",
                                LocalDate.of(1995, 1, 1),
                                "M",
                                "M12345678",
                                LocalDate.of(2030, 12, 31),
                                "01012345678",
                                true
                        )
                )
        );

        assertThrows(Exception.class,
                () -> paymentOrderService.createOrder(USER_ID, request));
    }
}