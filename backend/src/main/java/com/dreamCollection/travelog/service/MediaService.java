package com.dreamCollection.travelog.service;

import com.dreamCollection.travelog.dto.upload.UploadResultDTO;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.util.List;

@Transactional
public interface MediaService {

    UploadResultDTO upload(Long tno, List<MultipartFile> request);
    void deleteMedia(Long mno);
    void deleteAllByTrip(Long tno);
    ResponseEntity<Resource> view(Long mno) throws MalformedURLException;

}
