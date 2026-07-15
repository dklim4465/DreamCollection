package com.dreamCollection.place.dto;

import com.dreamCollection.place.entity.Place;
import com.dreamCollection.place.entity.PlaceCategory;
import com.dreamCollection.place.entity.PlaceSource;

import java.math.BigDecimal;

public record PlaceResponse(
        Long id,
        String externalPlaceId,
        PlaceSource source,
        String name,
        PlaceCategory category,
        String address,
        BigDecimal latitude,
        BigDecimal longitude,
        String city,
        String region,
        String country,
        String countryCode,
        BigDecimal rating,
        Integer reviewCount,
        String priceLevel,
        String placeType,
        String openingHoursText,
        String description,
        String imageUrl,
        String externalUrl
) {
    public static PlaceResponse from(Place place) {
        return new PlaceResponse(
                place.getId(),
                place.getExternalPlaceId(),
                place.getSource(),
                place.getName(),
                place.getCategory(),
                place.getAddress(),
                place.getLatitude(),
                place.getLongitude(),
                place.getCity(),
                place.getRegion(),
                place.getCountry(),
                place.getCountryCode(),
                place.getRating(),
                place.getReviewCount(),
                place.getPriceLevel(),
                place.getPlaceType(),
                place.getOpeningHoursText(),
                place.getDescription(),
                place.getImageUrl(),
                place.getExternalUrl()
        );
    }
}