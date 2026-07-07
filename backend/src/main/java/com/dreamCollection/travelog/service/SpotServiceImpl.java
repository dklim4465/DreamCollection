package com.dreamCollection.travelog.service;

import com.dreamCollection.travelog.domain.Media;
import com.dreamCollection.travelog.repository.MediaRepository;
import com.dreamCollection.travelog.repository.SpotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class SpotServiceImpl implements SpotService{

    private final MediaRepository mediaRepository;

    private final SpotRepository spotRepository;

    public void createSpot(Long tno) {

        List<Media> mediaList = mediaRepository.findByTripLog_Tno(tno);
    }
}
