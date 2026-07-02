package com.backend.flight.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** DB: flights 테이블 매핑 (항공권 API 캐시) */
@Entity
@Table(name = "flights")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Flight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "api_provider", length = 30)
    private String apiProvider;

    @Column(name = "graphql_operation_name", length = 50)
    private String graphqlOperationName;

    @Column(length = 50)
    private String airline;

    @Column(name = "departure_code", length = 10)
    private String departureCode;

    @Column(name = "arrival_code", length = 10)
    private String arrivalCode;

    @Column(name = "departure_datetime")
    private LocalDateTime departureDatetime;

    @Column(name = "arrival_datetime")
    private LocalDateTime arrivalDatetime;

    private Integer price;

    @Column(length = 10)
    private String currency;

    @Column(name = "seat_class", length = 20)
    private String seatClass;

    @Column(name = "booking_deep_link", length = 255)
    private String bookingDeepLink;

    @Column(name = "api_response_id", length = 100)
    private String apiResponseId;

    @Column(name = "fetched_at")
    private LocalDateTime fetchedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Builder
    public Flight(String apiProvider, String graphqlOperationName, String airline, String departureCode,
                  String arrivalCode, LocalDateTime departureDatetime, LocalDateTime arrivalDatetime,
                  Integer price, String currency, String seatClass, String bookingDeepLink,
                  String apiResponseId, LocalDateTime fetchedAt, LocalDateTime expiresAt) {
        this.apiProvider = apiProvider;
        this.graphqlOperationName = graphqlOperationName;
        this.airline = airline;
        this.departureCode = departureCode;
        this.arrivalCode = arrivalCode;
        this.departureDatetime = departureDatetime;
        this.arrivalDatetime = arrivalDatetime;
        this.price = price;
        this.currency = currency;
        this.seatClass = seatClass;
        this.bookingDeepLink = bookingDeepLink;
        this.apiResponseId = apiResponseId;
        this.fetchedAt = fetchedAt;
        this.expiresAt = expiresAt;
    }
}
