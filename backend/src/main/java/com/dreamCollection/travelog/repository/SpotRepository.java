package com.dreamCollection.travelog.repository;

import com.dreamCollection.travelog.domain.Spot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpotRepository extends JpaRepository<Spot, Long> {
}
