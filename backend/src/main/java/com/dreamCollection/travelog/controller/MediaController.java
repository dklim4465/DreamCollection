package com.dreamCollection.travelog.controller;

import com.dreamCollection.travelog.dto.upload.UploadResultDTO;
import com.dreamCollection.travelog.service.MediaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/api/media")
public class MediaController {

    private final MediaService mediaService;

    @PostMapping(value = "/tripLog/{tno}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadResultDTO upload(@PathVariable Long tno, @RequestPart("files")List<MultipartFile> files) {
        return mediaService.upload(tno, files);
    }

    @DeleteMapping("/{mno}")
    public void deleteMedia(@PathVariable Long mno) {
        mediaService.deleteMedia(mno);
    }

    @GetMapping("/{mno}/file")
    public ResponseEntity<Resource> viewMedia(@PathVariable Long mno) {
        try {
            return mediaService.view(mno);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    @GetMapping("/{mno}")
    public void readMedia(@PathVariable Long mno) {

    }

}
