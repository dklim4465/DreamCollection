package com.dreamCollection.place.api;

import com.dreamCollection.place.entity.Place;
import com.dreamCollection.place.entity.PlaceCategory;
import com.dreamCollection.place.entity.PlaceSource;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class SerpPlaceMapper {

    public Place toEntity(JsonNode node, String city, PlaceCategory category) {
        String externalPlaceId = firstNonBlank(
                node.path("place_id").asText(null),
                node.path("data_id").asText(null),
                node.path("data_cid").asText(null),
                node.path("provider_id").asText(null)
        );

        JsonNode gps = node.path("gps_coordinates");

        return Place.builder()
                .externalPlaceId(externalPlaceId)
                .source(PlaceSource.SERP_GOOGLE_MAPS)
                .name(node.path("title").asText(null))
                .category(category)
                .address(node.path("address").asText(null))
                .latitude(decimalOrNull(gps.path("latitude")))
                .longitude(decimalOrNull(gps.path("longitude")))
                .city(city)
                .region(city)
                .country("일본")
                .countryCode("JP")
                .rating(decimalOrNull(node.path("rating")))
                .reviewCount(intOrNull(node.path("reviews")))
                .priceLevel(node.path("price").asText(null))
                .placeType(node.path("type").asText(null))
                .openingHoursText(firstNonBlank(
                        node.path("hours").asText(null),
                        node.path("open_state").asText(null)
                ))
                .description(node.path("description").asText(null))
                .imageUrl(firstNonBlank(
                        node.path("thumbnail").asText(null),
                        node.path("serpapi_thumbnail").asText(null)
                ))
                .externalUrl(firstNonBlank(
                        node.path("place_id_search").asText(null),
                        node.path("website").asText(null)
                ))
                .active(true)
                .build();
    }

    public boolean isMappable(JsonNode node) {
        String externalPlaceId = firstNonBlank(
                node.path("place_id").asText(null),
                node.path("data_id").asText(null),
                node.path("data_cid").asText(null),
                node.path("provider_id").asText(null)
        );

        String title = node.path("title").asText(null);

        return externalPlaceId != null
                && !externalPlaceId.isBlank()
                && title != null
                && !title.isBlank();
    }

    private BigDecimal decimalOrNull(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }

        String value = node.asText(null);
        if (value == null || value.isBlank()) {
            return null;
        }

        return new BigDecimal(value);
    }

    private Integer intOrNull(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }

        return node.isNumber() ? node.asInt() : null;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }
}