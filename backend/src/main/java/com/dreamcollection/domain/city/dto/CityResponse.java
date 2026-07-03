package com.dreamcollection.domain.city.dto;

import com.dreamcollection.domain.city.entity.City;

import java.math.BigDecimal;

public record CityResponse(
        Long id,
        String nameKo,
        String nameEn,
        String countryName,
        BigDecimal latitude,
        BigDecimal longitude,
        String imageUrl
) {
    public static CityResponse from(City city) {
        return new CityResponse(
                city.getId(),
                city.getNameKo(),
                city.getNameEn(),
                city.getCountryName(),
                city.getLatitude(),
                city.getLongitude(),
                city.getImageUrl()
        );
    }
}
