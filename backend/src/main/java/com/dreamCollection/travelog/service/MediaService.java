package com.dreamCollection.travelog.service;

import com.dreamCollection.travelog.dto.upload.UploadRequestDTO;
import com.dreamCollection.travelog.dto.upload.UploadResultDTO;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;

import java.net.MalformedURLException;

@Transactional
public interface MediaService {

    UploadResultDTO upload(UploadRequestDTO request);
    void deleteMedia(Long mno);
    void deleteAllByTrip(Long tno);
    ResponseEntity<Resource> view(Long mno) throws MalformedURLException;

}
