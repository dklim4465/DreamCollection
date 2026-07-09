package com.dreamCollection.trip.option;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TripOptionProvider {

    public List<String> getOptions(String type) {
        return TripOptionType.from(type).getOptions();
    }
}