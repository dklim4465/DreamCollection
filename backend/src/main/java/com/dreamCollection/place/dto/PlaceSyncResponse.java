package com.dreamCollection.place.dto;

public record PlaceSyncResponse(
        String city,
        int requestedCategoryCount,
        int insertedCount,
        int skippedCount
) {
}