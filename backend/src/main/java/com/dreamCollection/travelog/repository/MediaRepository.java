package com.dreamCollection.travelog.repository;

import com.dreamCollection.travelog.domain.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MediaRepository extends JpaRepository<Media, Long> {

    List<Media> findByTripLog_Tno(Long tno);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from Media m where m.tripLog.tno = :tno")
    int deleteByTripLog_Tno(Long tno);

    @Query("select m from Media m where m.tripLog.tno = :tno " +
            "and m.spot IS NULL order by m.takenAt asc")
    List<Media> findClusterTargetMedia(@Param("tno") Long tno);

    @Modifying
    @Query("update Media m set m.spot = null where m.tripLog.tno = :tno " +
            "and m.spot.spotSource = com.dreamCollection.travelog.domain.SpotSource.AUTO")
    void detachAutoSpot(Long tno);

}
