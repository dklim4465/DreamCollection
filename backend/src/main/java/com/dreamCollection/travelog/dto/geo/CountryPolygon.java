package com.dreamCollection.travelog.dto.geo;

import org.locationtech.jts.geom.Geometry;

public record CountryPolygon(String code, Geometry geometry) {
}
