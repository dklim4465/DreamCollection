package com.dreamCollection.stats.service;

import com.dreamCollection.city.repository.CityRepository;
import com.dreamCollection.stats.dto.StatsResponse;
import com.dreamCollection.travelog.repository.TripLogRepository;
import com.dreamCollection.trip.repository.SavedTripRepository;
import com.dreamCollection.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final SavedTripRepository savedTripRepository;
    private final UserRepository userRepository;
    private final TripLogRepository tripLogRepository;
    private final CityRepository cityRepository;

    public StatsResponse getStats() {
        return new StatsResponse(
                savedTripRepository.count(),
                userRepository.count(),
                tripLogRepository.count(),
                cityRepository.countDistinctCountryCode()
        );
    }
}
