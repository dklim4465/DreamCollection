package com.dreamCollection.travelog.repository;

import com.dreamCollection.travelog.domain.Spot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface SpotRepository extends JpaRepository<Spot, Long> {

    @Modifying
    @Query("delete from Spot s where s.tripLog.tno = :tno " +
            "and s.spotSource = com.dreamCollection.travelog.domain.SpotSource.AUTO")
    void deleteAutoSpot(Long tno);
}
