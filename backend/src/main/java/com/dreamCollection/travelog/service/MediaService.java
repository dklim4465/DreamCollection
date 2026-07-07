package com.dreamcollection.travelog.service;

import com.dreamcollection.travelog.dto.upload.UploadRequestDTO;
import com.dreamcollection.travelog.dto.upload.UploadResultDTO;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;

import java.net.MalformedURLException;

@Transactional
public interface MediaService {

    UploadResultDTO upload(UploadRequestDTO request);
    void deleteMedia(Long mno);
    ResponseEntity<Resource> view(Long mno) throws MalformedURLException;
}
