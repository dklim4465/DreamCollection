package com.dreamCollection.travelog.repository;

import com.dreamCollection.travelog.domain.Spot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SpotRepository extends JpaRepository<Spot, Long> {

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from Spot s where s.tripLog.tno = :tno " +
            "and s.spotSource = com.dreamCollection.travelog.domain.SpotSource.AUTO")
    void deleteAutoSpot(Long tno);

    void deleteByTripLog_Tno(Long tno);

    @Query("select distinct s from Spot s left join fetch s.medias m where s.tripLog.tno = :tno")
    List<Spot> findWithMediasByTripLog_Tno(Long tno);

    List<Spot> findByTripLog_TnoOrderByVisitAtAsc(Long tno);
}
