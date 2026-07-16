package com.dreamCollection.travelog.dto.geo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@JsonIgnoreProperties(ignoreUnknown = true)
public class GeoJsonFeatureCollection {

    private String type;

    private List<Feature> features;

    @Getter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Feature {
        private Map<String, Object> properties;
        private JsonNode geometry;
    }
}
