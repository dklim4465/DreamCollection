package com.dreamCollection.travelog.config;

import com.dreamCollection.travelog.dto.geo.CountryPolygon;
import com.dreamCollection.travelog.dto.geo.GeoJsonFeatureCollection;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Value;
import lombok.extern.log4j.Log4j2;
import org.locationtech.jts.geom.*;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableJpaAuditing
@EnableAsync
@Log4j2
public class travelLogConfig {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration()
                .setFieldMatchingEnabled(true)
                .setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE)
                .setMatchingStrategy(MatchingStrategies.LOOSE);

        return modelMapper;
    }

    @Bean
    public GeometryFactory geometryFactory() {
        return new GeometryFactory(new PrecisionModel(), 4326);
    }

    @Bean
    public List<CountryPolygon> countryPolygons() {
        return loadGeoJson();
    }

    @Bean
    public RestClient aiRestClient() {
        return RestClient.builder()
                .baseUrl("http://127.0.0.1:5000")
                .build();
    }

    @Bean
    public RestClient exchangeRateClient() {
        return RestClient.builder()
                .baseUrl("https://api.frankfurter.dev")
                .build();
    }

    private List<CountryPolygon> loadGeoJson() {
        List<CountryPolygon> countries = new ArrayList<>();

        try {
            ClassPathResource resource = new ClassPathResource("geo/countries.geojson");

            GeoJsonFeatureCollection collection = objectMapper.readValue(
                    resource.getInputStream(), GeoJsonFeatureCollection.class
            );

            return collection.getFeatures()
                    .stream()
                    .map(feature -> {
                        String code = (String) feature.getProperties().get("ISO_A2");
                        Geometry geometry = convertGeometry(feature.getGeometry());

                        return new CountryPolygon(code, geometry);
                    }).filter(country -> country.code() != null)
                    .toList();
        } catch (Exception e) {
            throw new RuntimeException("Failed to load geojson", e);
        }
    }

    private Geometry convertGeometry(JsonNode geometryNode) {
        String type = geometryNode.get("type").asText();

        JsonNode coordinates = geometryNode.get("coordinates");

        return switch (type) {
            case "Polygon" -> converPolygon(coordinates);
            case "MultiPolygon" -> convertMultiPolygon(coordinates);
            default -> throw new IllegalArgumentException("Unsupported geometry type: " + type);
        };
    }

    private Polygon converPolygon(JsonNode coordinates) {
        LinearRing shell = geometryFactory().createLinearRing(
                convertCoordinates(coordinates.get(0))
        );

        LinearRing[] holes = new LinearRing[coordinates.size() - 1];

        for (int i = 1; i < coordinates.size(); i++) {
            holes[i - 1] = geometryFactory().createLinearRing(convertCoordinates(coordinates.get(i)));
        }

        return geometryFactory().createPolygon(shell, holes);
    }

    private MultiPolygon convertMultiPolygon(JsonNode coordinates) {
        Polygon[] polygons = new Polygon[coordinates.size()];

        for (int i = 0; i < coordinates.size(); i++) {
            polygons[i] = converPolygon(coordinates.get(i));
        }

        return geometryFactory().createMultiPolygon(polygons);
    }

    private Coordinate[] convertCoordinates(JsonNode coordinates) {
        Coordinate[] result = new Coordinate[coordinates.size()];

        for (int i = 0; i < coordinates.size(); i++) {
            JsonNode point = coordinates.get(i);

            result[i] = new Coordinate(point.get(0).asDouble(), point.get(1).asDouble());
        }

        return result;
    }
}
