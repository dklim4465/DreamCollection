package com.dreamCollection.travelog.service;

import com.dreamCollection.travelog.dto.TripLogOverviewDTO;
import com.dreamCollection.travelog.dto.TripLogStatisticsDTO;
import com.dreamCollection.travelog.dto.request.TripLogRequestDTO;
import com.dreamCollection.travelog.dto.response.TripLogResponseDTO;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;
import java.util.List;

@Transactional
public interface TripLogService {

    Long registerTrip(Long userId, TripLogRequestDTO tripLogRequestDTO);
    TripLogResponseDTO readTrip(Long userId, Long tno);
    void updateTrip(Long userId, Long tno, TripLogRequestDTO tripLogRequestDTO);
    void removeTrip(Long userId, Long tno);
    TripLogOverviewDTO getOverview(Long userId, Long tno);
    TripLogOverviewDTO getSharedTripLog(String token) throws AccessDeniedException;
    List<TripLogResponseDTO> getList(Long userId);
    TripLogStatisticsDTO getStatistics(Long tno);

}