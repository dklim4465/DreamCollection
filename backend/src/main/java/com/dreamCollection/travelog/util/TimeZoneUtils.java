package com.dreamCollection.travelog.util;

import org.locationtech.jts.geom.Point;
import us.dustinj.timezonemap.TimeZone;
import us.dustinj.timezonemap.TimeZoneMap;

public final class TimeZoneUtils {

    private static final TimeZoneMap TIME_ZONE_MAP = TimeZoneMap.forEverywhere();

    private TimeZoneUtils() {}

    public static String fromPoint(Point point) {
        return fromLatLng(point.getY(), point.getX());
    }

    public static String fromLatLng(double latitude, double longitude) {
        TimeZone timeZone = TIME_ZONE_MAP.getOverlappingTimeZone(latitude, longitude);
        return timeZone != null ? timeZone.getZoneId() : null;
    }
}
