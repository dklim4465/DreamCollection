package com.dreamCollection.accommodation.repository;

import com.dreamCollection.accommodation.entity.Accommodation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccommodationRepository extends JpaRepository<Accommodation, Long> {

    List<Accommodation> findByRegionOrderByDisplayOrderAsc(String region);
}
