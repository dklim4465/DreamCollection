package com.dreamCollection.city.dto;

import com.dreamCollection.city.entity.City;

import java.math.BigDecimal;

public record CityResponse(
        Long id,
        String nameKo,
        String nameEn,
        String countryCode,
        String countryName,
        BigDecimal latitude,
        BigDecimal longitude,
        String timezone,
        String imageUrl
) {
    public static CityResponse from(City city) {
        return new CityResponse(
                city.getId(),
                city.getNameKo(),
                city.getNameEn(),
                city.getCountryCode(),
                city.getCountryName(),
                city.getLatitude(),
                city.getLongitude(),
                city.getTimezone(),
                city.getImageUrl()
        );
    }
}
