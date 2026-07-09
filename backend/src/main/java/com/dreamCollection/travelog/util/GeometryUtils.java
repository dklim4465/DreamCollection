package com.dreamCollection.travelog.util;

import com.dreamCollection.travelog.dto.GeoJsonPointDTO;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GeometryUtils {

    private final GeometryFactory geometryFactory;

    public Point createPoint(double latitude, double longitude) {
        return geometryFactory.createPoint(
                new Coordinate(longitude, latitude)
        );
    }

    public double distanceMeter(Point p1, Point p2) {

        double lat1 = p1.getY();
        double lon1 = p1.getX();

        double lat2 = p2.getY();
        double lon2 = p2.getX();

        final double R = 6371000;

        double dlat = Math.toRadians(lat2 - lat1);
        double dlon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dlat / 2) * Math.sin(dlat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dlon / 2) * Math.sin(dlon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    public Point toPoint(GeoJsonPointDTO dto) {

        if (dto == null || dto.getCoordinates() == null) {
            return null;
        }

        return createPoint(dto.getCoordinates()[0], dto.getCoordinates()[1]);
    }

    public GeoJsonPointDTO toGeoJson(Point point) {

        if (point == null) {
            return null;
        }

        if (point.getSRID() != 4326) {
            throw new IllegalArgumentException("Unsupported SRID");
        }

        return new GeoJsonPointDTO("Point",
                new double[] {point.getX(), point.getY()});
    }

}
