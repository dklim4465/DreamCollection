package com.dreamCollection.travelog.service;

import com.dreamCollection.travelog.dto.geo.CountryPolygon;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CountryResolver {

    private final List<CountryPolygon> countryPolygons;

    private final GeometryFactory geometryFactory;

    public String findCountry(Point point) {
        return countryPolygons.stream()
                .filter(country -> country.geometry().contains(point))
                .map(CountryPolygon::code)
                .findFirst()
                .orElse(null);
    }
}
