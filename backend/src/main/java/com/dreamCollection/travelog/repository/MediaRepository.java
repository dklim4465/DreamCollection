package com.dreamCollection.travelog.repository;

import com.dreamCollection.travelog.domain.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MediaRepository extends JpaRepository<Media, Long> {

    List<Media> findByTripLog_Tno(Long tno);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from Media m where m.tripLog.tno = :tno")
    int deleteByTripLog_Tno(Long tno);
}
