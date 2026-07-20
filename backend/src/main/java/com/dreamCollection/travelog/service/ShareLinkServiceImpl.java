package com.dreamCollection.travelog.service;

import com.dreamCollection.travelog.domain.ShareLink;
import com.dreamCollection.travelog.domain.ShareType;
import com.dreamCollection.travelog.domain.TripLog;
import com.dreamCollection.travelog.repository.ShareLinkRepository;
import com.dreamCollection.travelog.repository.TripLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Log4j2
public class ShareLinkServiceImpl implements ShareLinkService {

    private final ShareLinkRepository shareLinkRepository;

    private final TripLogRepository tripLogRepository;

    @Override
    @Transactional
    public ShareLink createShareLink(Long tno, Long userId) {

        Optional<TripLog> result = tripLogRepository.findByTnoAndUser_Id(tno, userId);
        TripLog tripLog = result.orElseThrow();

        ShareLink activeLink = shareLinkRepository.findFirstByTripLog_TnoAndActiveTrue(tno).orElse(null);

        if (activeLink != null) {
            if (activeLink.isAvailable()) {
                return activeLink;
            }
            activeLink.setActive(false);
        }

        ShareLink newShareLink = ShareLink.builder()
                .token(UUID.randomUUID().toString().replace("-", ""))
                .tripLog(tripLog)
                .active(true)
                .shareType(ShareType.LINK_VIEW)
                .build();

        return shareLinkRepository.save(newShareLink);
    }

    @Override
    @Transactional
    public void deactiveShareLink(Long tno, Long userId) {

        TripLog tripLog = tripLogRepository.findByTnoAndUser_Id(tno, userId).orElseThrow();

        ShareLink shareLink = shareLinkRepository.findFirstByTripLog_TnoAndActiveTrue(tno).orElseThrow();

        shareLink.setActive(false);
    }
}
