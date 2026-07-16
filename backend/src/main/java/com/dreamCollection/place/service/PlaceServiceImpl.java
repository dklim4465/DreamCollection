package com.dreamCollection.place.service;

import com.dreamCollection.place.dto.PlaceResponse;
import com.dreamCollection.place.entity.PlaceCategory;
import com.dreamCollection.place.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlaceServiceImpl implements PlaceService {

    private final PlaceRepository placeRepository;

    @Transactional(readOnly = true)
    public List<PlaceResponse> getPlaces(String city, PlaceCategory category) {
        if (category == null) {
            return placeRepository.findByCityAndActiveTrueOrderByCategoryAscRatingDescReviewCountDesc(city)
                    .stream()
                    .map(PlaceResponse::from)
                    .toList();
        }

        return placeRepository.findByCityAndCategoryAndActiveTrueOrderByRatingDescReviewCountDesc(city, category)
                .stream()
                .map(PlaceResponse::from)
                .toList();
    }
}