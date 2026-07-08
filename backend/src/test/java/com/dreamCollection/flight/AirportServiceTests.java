package com.dreamCollection.flight;

import com.dreamCollection.flight.dto.AirportOptionDTO;
import com.dreamCollection.flight.service.AirportService;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
@Log4j2
public class AirportServiceTests {

    @Autowired
    private AirportService airportService;

    @Test
    void regionToFind(){
        List<AirportOptionDTO> airportOptionDTOS = airportService.recommendAirports("일본", 5);

        log.info(airportOptionDTOS);
    }
}
