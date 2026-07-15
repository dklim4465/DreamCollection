package com.dreamCollection.travelog.service;

import com.dreamCollection.travelog.dto.SpotDetailDTO;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Transactional
public interface SpotService {

    void createSpot(Long tno);
    void clusteringSpot(Long tno);
    void deleteAllByTrip(Long tno);
    List<SpotDetailDTO> getSpotDetailDTOsByTno(Long tno);

}
