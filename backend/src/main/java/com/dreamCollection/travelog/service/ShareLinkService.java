package com.dreamCollection.travelog.service;

import com.dreamCollection.travelog.domain.ShareLink;
import com.dreamCollection.travelog.dto.TripLogOverviewDTO;
import org.springframework.transaction.annotation.Transactional;

@Transactional
public interface ShareLinkService {

    ShareLink createShareLink(Long tno, Long userId);
    void deactiveShareLink(Long tno, Long userId);
}
