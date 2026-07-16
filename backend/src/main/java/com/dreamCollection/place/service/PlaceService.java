package com.dreamCollection.place.service;

import com.dreamCollection.place.dto.PlaceResponse;
import com.dreamCollection.place.entity.PlaceCategory;

import java.util.List;

public interface PlaceService {
    List<PlaceResponse> getPlaces(String city, PlaceCategory category);
}
