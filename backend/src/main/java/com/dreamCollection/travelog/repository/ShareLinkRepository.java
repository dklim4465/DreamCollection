package com.dreamCollection.travelog.repository;

import com.dreamCollection.travelog.domain.ShareLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShareLinkRepository extends JpaRepository<ShareLink, Long> {

    Optional<ShareLink> findByToken(String token);

    Optional<ShareLink> findFirstByTripLog_TnoAndActiveTrue(Long tno);

    void deleteByTripLog_Tno(Long tno);
}
