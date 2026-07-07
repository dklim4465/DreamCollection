package com.dreamCollection.travelog.service;

import com.dreamCollection.travelog.dto.request.TripLogRequestDTO;
import com.dreamCollection.travelog.dto.response.TripLogResponseDTO;
import org.springframework.transaction.annotation.Transactional;

@Transactional
public interface TripLogService {

    Long registerTrip(TripLogRequestDTO tripLogRequestDTO);
    TripLogResponseDTO readTrip(Long tno);
    void updateTrip(Long tno, TripLogRequestDTO tripLogRequestDTO);
    void removeTrip(Long tno);

}