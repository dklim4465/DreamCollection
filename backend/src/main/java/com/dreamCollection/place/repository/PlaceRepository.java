package com.dreamCollection.place.repository;

import com.dreamCollection.place.entity.Place;
import com.dreamCollection.place.entity.PlaceCategory;
import com.dreamCollection.place.entity.PlaceSource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlaceRepository extends JpaRepository<Place, Long> {

    List<Place> findByCityAndActiveTrueOrderByCategoryAscRatingDescReviewCountDesc(String city);

    List<Place> findByCityAndCategoryAndActiveTrueOrderByRatingDescReviewCountDesc(
            String city,
            PlaceCategory category
    );

    Optional<Place> findBySourceAndExternalPlaceId(PlaceSource source, String externalPlaceId);
}