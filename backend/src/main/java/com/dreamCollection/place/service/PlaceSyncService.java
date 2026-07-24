package com.dreamCollection.place.service;

import com.dreamCollection.place.dto.PlaceSyncResponse;

public interface PlaceSyncService {

    PlaceSyncResponse syncSerpPlaces(String city);
}
