package com.dreamCollection.travelog.service;

import com.dreamCollection.travelog.domain.*;
import com.dreamCollection.travelog.dto.MediaSummaryDTO;
import com.dreamCollection.travelog.dto.SpotClusterDTO;
import com.dreamCollection.travelog.dto.SpotDetailDTO;
import com.dreamCollection.travelog.repository.MediaRepository;
import com.dreamCollection.travelog.repository.SpotRepository;
import com.dreamCollection.travelog.util.GeometryUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class SpotServiceImpl implements SpotService{

    private static final double MAX_RADIUS_METER = 300;
    private static final double MAX_SPEED_KMH = 30;
    private static final Duration MAX_INTERVAL = Duration.ofHours(2);

    private final GeometryUtils geometryUtils;

    private final MediaRepository mediaRepository;
    private final SpotRepository spotRepository;

    @Override
    @Transactional
    public void createSpot(Long tno) {


    }

    @Override
    @Transactional
    public void clusteringSpot(Long tno) {

        mediaRepository.detachAutoSpot(tno);
        spotRepository.deleteAutoSpot(tno);

        List<Media> mediaList = mediaRepository.findClusterTargetMedia(tno);

        if (mediaList.isEmpty()) {
            return;
        }

        List<SpotClusterDTO> clusters = createClusters(mediaList);

        for (SpotClusterDTO cluster : clusters) {
            Spot spot = Spot.builder()
                    .tripLog(TripLog.builder().tno(tno).build())
                    .spotSource(SpotSource.AUTO)
                    .spotType(SpotType.ETC)
                    .centerLocation(cluster.getCenter(geometryUtils))
                    .visitAt(cluster.getVisitAt())
                    .leaveAt(cluster.getLeaveAt())
                    .build();

            spotRepository.save(spot);

            for (Media media : cluster.getMediaList()) {
                media.changeSpot(spot);
            }
        }
    }

    @Override
    @Transactional
    public void deleteAllByTrip(Long tno) {
        spotRepository.deleteByTripLog_Tno(tno);
    }

    private List<SpotClusterDTO> createClusters(List<Media> mediaList) {

        List<SpotClusterDTO> clusters = new ArrayList<>();

        SpotClusterDTO current = new SpotClusterDTO();
        current.add(mediaList.getFirst(), geometryUtils);

        clusters.add(current);

        for (int i =1; i < mediaList.size(); i++) {

            Media media = mediaList.get(i);

            long seconds = Duration.between(
                    current.getLastMedia().getTakenAt(), media.getTakenAt()).getSeconds();

            boolean createNewSpot = false;

            if (seconds >= MAX_INTERVAL.getSeconds()) {
                createNewSpot = true;
            } else {

                double distance = geometryUtils.distanceMeter(
                        current.getLastMedia().getLocation(), media.getLocation());

                double speed = seconds == 0 ? Double.MAX_VALUE : distance / seconds * 3.6;

                if (speed >= MAX_SPEED_KMH) {
                    createNewSpot = true;
                } else {
                    createNewSpot = !current.canAdd(media, geometryUtils, MAX_RADIUS_METER);
                }
            }

            if (createNewSpot) {
                current = new SpotClusterDTO();

                clusters.add(current);
            }

            current.add(media, geometryUtils);
        }

        return clusters;
    }

    @Override
    @Transactional
    public List<SpotDetailDTO> getSpotDetailDTOsByTno(Long tno) {

        List<SpotDetailDTO> spotDetailDTOList = new ArrayList<>();

        List<Spot> spots = spotRepository.findWithMediasByTripLog_Tno(tno);

        spots.forEach(spot -> {

            List<MediaSummaryDTO> mediaSummaryList =
                    spot.getMedias().stream()
                            .map(media -> MediaSummaryDTO.builder()
                                    .mno(media.getMno())
                                    .mediaPath(media.getMediaPath())
                                    .storedFileName(media.getStoredFileName())
                                    .location(geometryUtils.toGeoJson(media.getLocation()))
                                    .takenAt(media.getTakenAt())
                                    .build())
                            .toList();

            SpotDetailDTO spotDetail = SpotDetailDTO.builder()
                    .sno(spot.getSno())
                    .name(spot.getName())
                    .description(spot.getDescription())
                    .centerLocation(geometryUtils.toGeoJson(spot.getCenterLocation()))
                    .visitAt(spot.getVisitAt())
                    .leaveAt(spot.getLeaveAt())
                    .coverImagePath(spot.getCoverImagePath())
                    .mediaList(mediaSummaryList)
                    .build();

            spotDetailDTOList.add(spotDetail);
        });

        return spotDetailDTOList;
    }
}
