package com.dreamCollection.travelog.repository;

import com.dreamCollection.travelog.domain.Media;
import com.dreamCollection.travelog.domain.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReceiptRepository extends JpaRepository<Receipt, Long> {

    @Query("""
        select r from Receipt r join r.media m join m.tripLog t
        where t.tno = :tno order by r.paidAt desc
        """)
    List<Receipt> findByTripLog(@Param("tno") Long tno);

    @Modifying
    @Query("delete from Receipt r where r.media in :medias")
    void deleteByMediaIn(@Param("medias")List<Media> medias);

    @Modifying
    @Query("delete from Receipt r where r.media.tripLog.tno = :tno")
    void deleteByTripLog(@Param("tno") Long tno);
}
