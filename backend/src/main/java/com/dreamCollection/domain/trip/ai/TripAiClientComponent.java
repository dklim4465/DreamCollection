package com.dreamcollection.domain.trip.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class TripAiClientComponent implements TripAiClient{

    @Override
    public String recommend(String prompt){
        log.info(prompt);

        return "Ai 미연결용 대체 응답";
    }
}
