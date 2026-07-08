package com.dreamCollection.travelog.service;

import org.springframework.transaction.annotation.Transactional;

@Transactional
public interface SpotService {

    void createSpot(Long tno);
    void clusteringSpot(Long tno);
}
