//package com.dreamCollection.flight;
//
//import com.dreamCollection.flight.dto.FlightOfferDTO;
//import com.dreamCollection.flight.dto.FlightRequestDTO;
//import com.dreamCollection.flight.service.FlightService;
//import com.dreamCollection.trip.dto.FlightConditionDTO;
//import lombok.extern.log4j.Log4j2;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//
//import java.time.LocalDate;
//import java.util.List;
//
//@SpringBootTest
//@Log4j2
//public class FlightServiceTests {
//
//    @Autowired
//    private FlightService flightService;
//
//    @Test
//    void flightApiSearch() {
//        FlightRequestDTO requestDTO = FlightRequestDTO.builder()
//                .region("일본")
//                .startDate(LocalDate.of(2026, 8, 1))
//                .when("2박 3일")
//                .flightCondition(
//                        FlightConditionDTO.builder()
//                                .skip(false)
//                                .seatClass("ECONOMY")
//                                .directOnly(true)
//                                .preferredDepartureTime("MORNING")
//                                .priority("PRICE")
//                                .build()
//                )
//                .build();
//
//        List<FlightOfferDTO> result = flightService.searchFlights(requestDTO);
//
//        log.info("항공 검색 결과 개수: {}", result.size());
//        result.forEach(log::info);
//    }
//}