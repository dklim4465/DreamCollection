package com.dreamCollection.travelog.controller;

import com.dreamCollection.travelog.dto.TripLogOverviewDTO;
import com.dreamCollection.travelog.dto.request.TripLogRequestDTO;
import com.dreamCollection.travelog.dto.response.TripLogResponseDTO;
import com.dreamCollection.travelog.service.TripLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/api/triplog")
public class TripLogController {

    private final TripLogService tripLogService;

    @PostMapping("/")
    public Map<String, Long> register(@AuthenticationPrincipal Long userId, @RequestBody TripLogRequestDTO tripLogRequestDTO) {

        log.info("register: " + tripLogRequestDTO);

        Long tno = tripLogService.registerTrip(userId, tripLogRequestDTO);

        return Map.of("result", tno);
    }

    @GetMapping("/{tno}")
    public TripLogResponseDTO read(@AuthenticationPrincipal Long userId, @PathVariable(name = "tno") Long tno) {

        log.info("read: " + tno);

        return tripLogService.readTrip(userId, tno);
    }

    @PatchMapping("/{tno}")
    public Map<String, String> modify(@AuthenticationPrincipal Long userId, @PathVariable(name = "tno") Long tno,@RequestBody TripLogRequestDTO tripLogRequestDTO) {

        log.info("modify: " + tno);

        tripLogService.updateTrip(userId, tno, tripLogRequestDTO);

        return Map.of("result", "success");
    }

    @DeleteMapping("/{tno}")
    public Map<String, String> remove(@AuthenticationPrincipal Long userId, @PathVariable(name = "tno") Long tno) {

        log.info("remove: " + tno);

        tripLogService.removeTrip(userId, tno);

        return Map.of("result", "success");
    }

    @GetMapping("/list")
    public List<TripLogResponseDTO> listTripLog(@AuthenticationPrincipal Long userId) {

        log.info("tripLog list");

        return tripLogService.getList(userId);
    }

    @GetMapping("/overview/{tno}")
    public TripLogOverviewDTO tripLogOverview(@AuthenticationPrincipal Long userId, @PathVariable(name = "tno") Long tno) {

        log.info("tripLog Overview: " + tno);

        return tripLogService.getOverview(userId, tno);

    }

}