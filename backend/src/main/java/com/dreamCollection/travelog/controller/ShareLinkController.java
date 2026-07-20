package com.dreamCollection.travelog.controller;

import com.dreamCollection.travelog.domain.ShareLink;
import com.dreamCollection.travelog.dto.TripLogOverviewDTO;
import com.dreamCollection.travelog.dto.response.ShareLinkResponseDTO;
import com.dreamCollection.travelog.service.ShareLinkService;
import com.dreamCollection.travelog.service.TripLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;

@RestController
@RequestMapping("/api/share")
@RequiredArgsConstructor
public class ShareLinkController {

    private final TripLogService tripLogService;
    private final ShareLinkService shareLinkService;

    private String frontendUrl = "http://localhost:3000/triplog";

    @PostMapping("/{tno}")
    public ShareLinkResponseDTO createShareLink(@PathVariable Long tno, @AuthenticationPrincipal Long userId) {
        ShareLink sharelink = shareLinkService.createShareLink(tno, userId);

        return new ShareLinkResponseDTO(frontendUrl + "/share/" + sharelink.getToken());
    }

    @GetMapping("/{token}")
    public TripLogOverviewDTO getSharedTrip(@PathVariable String token) {
        try {
            return tripLogService.getSharedTripLog(token);
        } catch (AccessDeniedException e) {
            throw new RuntimeException(e);
        }
    }

    @DeleteMapping("/{tno}")
    public void deleteShareLink(@PathVariable Long tno, @AuthenticationPrincipal Long userId) {
        shareLinkService.deactiveShareLink(tno, userId);
    }

}
