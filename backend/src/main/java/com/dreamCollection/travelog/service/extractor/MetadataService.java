package com.dreamCollection.travelog.service.extractor;

import com.dreamCollection.travelog.domain.MediaType;
import com.dreamCollection.travelog.dto.MetadataInfoDTO;
import com.dreamCollection.travelog.util.GeometryUtils;
import com.drew.imaging.ImageMetadataReader;
import com.drew.imaging.ImageProcessingException;
import com.drew.lang.GeoLocation;
import com.drew.metadata.Directory;
import com.drew.metadata.Metadata;
import com.drew.metadata.Tag;
import com.drew.metadata.exif.ExifSubIFDDirectory;
import com.drew.metadata.exif.GpsDirectory;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Path;
import java.time.Instant;
import java.util.Date;

@Service
@RequiredArgsConstructor
@Log4j2
public class MetadataService {

    private final GeometryUtils geometryUtils;

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
                location = geometryUtils.createPoint(geoLocation.getLatitude(), geoLocation.getLongitude());
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
