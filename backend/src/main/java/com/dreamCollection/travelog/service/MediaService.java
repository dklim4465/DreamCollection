package com.dreamCollection.travelog.service;

import com.dreamCollection.travelog.dto.MediaDetailDTO;
import com.dreamCollection.travelog.dto.upload.UploadResultDTO;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Transactional
public interface MediaService {

    UploadResultDTO upload(Long tno, List<MultipartFile> request);
    void deleteMedia(List<Long> mediaMnos);
    void deleteAllByTrip(Long tno);
    MediaDetailDTO getMediaDetail(Long mno);

}
