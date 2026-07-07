package com.dreamCollection.travelog.controller;

import com.dreamCollection.travelog.dto.upload.UploadRequestDTO;
import com.dreamCollection.travelog.dto.upload.UploadResultDTO;
import com.dreamCollection.travelog.service.MediaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/api/media")
public class MediaController {

    private final MediaService mediaService;

    @PostMapping(value = "/", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadResultDTO upload(UploadRequestDTO request) {
        return mediaService.upload(request);
    }

    @DeleteMapping("/{mno}")
    public void deleteMedia(@PathVariable Long mno) {
        mediaService.deleteMedia(mno);
    }

    @GetMapping("/{mno}")
    public ResponseEntity<Resource> viewMedia(@PathVariable Long mno) {
        try {
            return mediaService.view(mno);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

}
