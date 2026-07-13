package com.dreamCollection.accommodation;

import com.dreamCollection.accommodation.dto.AccommodationRequestDTO;
import com.dreamCollection.accommodation.dto.AccommodationResponseDTO;
import com.dreamCollection.accommodation.service.AccommodationService;
import com.dreamCollection.trip.dto.AccommodationConditionDTO;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.util.List;

@SpringBootTest
@Log4j2
public class AccommodationServiceTests {

    @Autowired
    private AccommodationService accommodationService;

    @Test
    void regionToFind(){
        AccommodationRequestDTO requestDTO = AccommodationRequestDTO.builder()
                .region("일본")
                .startDate(LocalDate.of(2026, 8, 1))
                .when("2박 3일")
                .accommodationCondition(
                        AccommodationConditionDTO.builder()
                                .skip(false)
                                .accommodationType("HOTEL")
                                .priority("LOCATION")
                                .maxPrice(200000)
                                .build()
                )
                .build();
        List<AccommodationResponseDTO> result = accommodationService.searchAccommodations(requestDTO);

        log.info(result);
    }
}
