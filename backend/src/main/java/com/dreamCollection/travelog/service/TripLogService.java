package com.dreamCollection.travelog.service;

import com.dreamCollection.travelog.dto.TripLogOverviewDTO;
import com.dreamCollection.travelog.dto.request.TripLogRequestDTO;
import com.dreamCollection.travelog.dto.response.TripLogResponseDTO;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Transactional
public interface TripLogService {

    Long registerTrip(Long userId, TripLogRequestDTO tripLogRequestDTO);
    TripLogResponseDTO readTrip(Long userId, Long tno);
    void updateTrip(Long userId, Long tno, TripLogRequestDTO tripLogRequestDTO);
    void removeTrip(Long userId, Long tno);
    TripLogOverviewDTO getOverview(Long userId, Long tno);
    List<TripLogResponseDTO> getList(Long userId);

}