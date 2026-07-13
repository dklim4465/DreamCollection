package com.dreamCollection.travelog.dto;

import com.dreamCollection.travelog.domain.Media;
import com.dreamCollection.travelog.domain.MediaType;
import com.dreamCollection.travelog.util.GeometryUtils;
import lombok.Getter;
import org.locationtech.jts.geom.Point;

import java.io.File;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
public class SpotClusterDTO {

    private final List<Media> mediaList = new ArrayList<>();

    private double sumLat;
    private double sumLon;

    private double radius;

    public void add(Media media, GeometryUtils geometryUtils) {

        mediaList.add(media);

        sumLat += media.getLocation().getY();
        sumLon += media.getLocation().getX();

        recalculateRadius(geometryUtils);
    }

    public boolean canAdd(Media media, GeometryUtils geometryUtils, double maxRadius) {

        List<Point> points = new ArrayList<>();

        for (Media m : mediaList) {
            points.add(m.getLocation());
        }

        points.add(media.getLocation());

        Point newCenter = geometryUtils.createPoint(
                (sumLat + media.getLocation().getY()) / points.size(),
                (sumLon + media.getLocation().getX()) / points.size()
        );

        double maxDistance = 0;

        for (Point point : points) {
            maxDistance = Math.max(maxDistance, geometryUtils.distanceMeter(newCenter, point));
        }

        return maxDistance <= maxRadius;
    }

    public Point getCenter(GeometryUtils geometryUtils) {
        return geometryUtils.createPoint(sumLat / mediaList.size(), sumLon / mediaList.size());
    }

    public Media getLastMedia() {
        return mediaList.getLast();
    }

    public Instant getVisitAt() {
        return mediaList.getFirst().getTakenAt();
    }

    public Instant getLeaveAt() {
        return mediaList.getLast().getTakenAt();
    }

    private void recalculateRadius(GeometryUtils geometryUtils) {

        List<Point> points = mediaList.stream()
                .map(Media::getLocation).toList();

        radius = 0;

        for (Point point : points) {
            radius = Math.max(radius, geometryUtils.distanceMeter(getCenter(geometryUtils), point));
        }
    }

    public String getCoverImagePath() {
        Media coverImage = mediaList.stream()
                .filter(media -> media.getMediaType() == MediaType.IMAGE)
                .findFirst()
                .orElse(null);

        if (coverImage == null || coverImage.getMediaPath() == null) {
            return null;
        }

        return coverImage.getMediaPath() + File.separator + "thumbnail"
                + File.separator + coverImage.getStoredFileName();
    }
}
