package com.dreamcollection.travelog.repository;

import com.dreamcollection.travelog.domain.Spot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpotRepository extends JpaRepository<Spot, Long> {
}
