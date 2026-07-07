package com.dreamcollection.travelog.service.extractor;

import com.dreamcollection.travelog.domain.MediaType;
import com.dreamcollection.travelog.dto.MetadataInfoDTO;
import com.drew.imaging.ImageMetadataReader;
import com.drew.imaging.ImageProcessingException;
import com.drew.lang.GeoLocation;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifSubIFDDirectory;
import com.drew.metadata.exif.GpsDirectory;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.time.Instant;
import java.util.Date;

@Service
public class MetadataService {

    private final GeometryFactory geometryFactory = new GeometryFactory();

    public MetadataInfoDTO extract(MediaType type, Path path) throws IOException, ImageProcessingException {

        return switch (type) {
            case IMAGE -> extractImageMetadata(path);
            case AUDIO -> extractAudioMetadata(path);
            case VIDEO -> extractVideoMetadata(path);
            case TEXT -> extractTextMetadata(path);
            default -> new MetadataInfoDTO(null, null);
        };
    }

    private MetadataInfoDTO extractImageMetadata(Path path) throws IOException, ImageProcessingException {

        Metadata metadata = ImageMetadataReader.readMetadata(path.toFile());

        ExifSubIFDDirectory exif = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);

        Instant takenAt = null;

        if (exif != null) {
            Date date = exif.getDateOriginal();

            if (date != null) {
                takenAt = date.toInstant();
            }
        }

        GpsDirectory gpsDirectory = metadata.getFirstDirectoryOfType(GpsDirectory.class);

        Point location = null;

        if (gpsDirectory != null) {

            GeoLocation geoLocation = gpsDirectory.getGeoLocation();

            if (geoLocation != null && !geoLocation.isZero()) {
                location = geometryFactory.createPoint(
                        new Coordinate(geoLocation.getLongitude(), geoLocation.getLatitude())
                );
            }
        }

        return new MetadataInfoDTO(takenAt, location);
    }

    private MetadataInfoDTO extractAudioMetadata(Path path) {

        return new MetadataInfoDTO(null, null);
    }

    private MetadataInfoDTO extractVideoMetadata(Path path) {

        return new MetadataInfoDTO(null, null);
    }

    private MetadataInfoDTO extractTextMetadata(Path path) {

        return new MetadataInfoDTO(null, null);
    }
}
