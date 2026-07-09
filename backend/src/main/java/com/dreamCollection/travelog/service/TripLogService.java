package com.dreamCollection.travelog.service;

import com.dreamCollection.travelog.dto.TripLogOverviewDTO;
import com.dreamCollection.travelog.dto.request.TripLogRequestDTO;
import com.dreamCollection.travelog.dto.response.TripLogResponseDTO;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Transactional
public interface TripLogService {

    Long registerTrip(TripLogRequestDTO tripLogRequestDTO);
    TripLogResponseDTO readTrip(Long tno);
    void updateTrip(Long tno, TripLogRequestDTO tripLogRequestDTO);
    void removeTrip(Long tno);
    TripLogOverviewDTO getOverview(Long tno);
    List<TripLogResponseDTO> getList();

}