package com.dreamCollection.trip.ai;

import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

@Log4j2
@Component
public class TripAiClientComponent implements TripAiClient{

    @Override
    public String recommend(String prompt){
        log.info(prompt);

        return "Ai 미연결용 대체 응답";
    }
}
