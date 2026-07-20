package com.dreamCollection.travelog.service;

import com.dreamCollection.travelog.domain.Media;
import com.dreamCollection.travelog.domain.ShareLink;
import com.dreamCollection.travelog.domain.TripLog;
import com.dreamCollection.travelog.dto.MediaDetailDTO;
import com.dreamCollection.travelog.dto.SpotDetailDTO;
import com.dreamCollection.travelog.dto.TripLogOverviewDTO;
import com.dreamCollection.travelog.dto.request.TripLogRequestDTO;
import com.dreamCollection.travelog.dto.response.TripLogResponseDTO;
import com.dreamCollection.travelog.repository.ShareLinkRepository;
import com.dreamCollection.travelog.repository.TripLogRepository;
import com.dreamCollection.user.entity.User;
import com.dreamCollection.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Log4j2
public class TripLogServiceImpl implements TripLogService {

    private final ModelMapper modelMapper;

    private final TripLogRepository tripLogRepository;
    private final UserRepository userRepository;
    private final ShareLinkRepository shareLinkRepository;

    private final MediaService mediaService;
    private final SpotService spotService;

    @Override
    @Transactional
    public Long registerTrip(Long userId, TripLogRequestDTO tripLogRequestDTO) {

        User user = userRepository.getReferenceById(userId);

        TripLog tripLog = modelMapper.map(tripLogRequestDTO, TripLog.class);

        tripLog.changeUser(user);

        List<String> tags = extract(tripLog.getDescription());

        tags.forEach(tripLog::addTag);

        TripLog result = tripLogRepository.save(tripLog);

        return result.getTno();
    }

    @Override
    @Transactional
    public TripLogResponseDTO readTrip(Long userId, Long tno) {

        Optional<TripLog> result = tripLogRepository.findByTnoAndUser_Id(tno, userId);
        TripLog tripLog = result.orElseThrow();

        TripLogResponseDTO tripLogResponseDTO = modelMapper.map(tripLog, TripLogResponseDTO.class);
        tripLogResponseDTO.setThumbnailPath(normalizePath(tripLogResponseDTO.getThumbnailPath()));

        return tripLogResponseDTO;
    }

    @Override
    @Transactional
    public void updateTrip(Long userId, Long tno, TripLogRequestDTO tripLogRequestDTO) {

        TripLog tripLog = tripLogRepository.findByTnoAndUser_Id(tno, userId).orElseThrow();

        tripLog.changeTitle(tripLogRequestDTO.getTitle());
        tripLog.changeStartDate(tripLogRequestDTO.getStartDate());
        tripLog.changeEndDate(tripLogRequestDTO.getEndDate());
        tripLog.changeDesc(tripLogRequestDTO.getDescription());

        if (tripLogRequestDTO.getThumbnailMediaMno() != null) {
            MediaDetailDTO thumbnailMedia = mediaService.getMediaDetail(tripLogRequestDTO.getThumbnailMediaMno());

            String thumbnailPath = thumbnailMedia.getMediaPath() + "/thumbnail/" + thumbnailMedia.getStoredFileName();

            tripLog.changeThumbnail(thumbnailPath);
        }

        tripLog.clearTags();

        List<String> tags = extract(tripLog.getDescription());

        tags.forEach(tripLog::addTag);

        tripLogRepository.save(tripLog);
    }

    @Override
    @Transactional
    public void removeTrip(Long userId, Long tno) {

        TripLog tripLog = tripLogRepository.findByTnoAndUser_Id(tno, userId).orElseThrow();

        shareLinkRepository.deleteByTripLog_Tno(tno);
        
        mediaService.deleteAllByTrip(tno);

        spotService.deleteAllByTrip(tno);

        tripLogRepository.delete(tripLog);
    }

    @Override
    @Transactional
    public TripLogOverviewDTO getOverview(Long userId, Long tno) {

        TripLog tripLog = tripLogRepository.findByTnoAndUser_Id(tno, userId).orElseThrow();

        return toOverviewDTO(tripLog);
    }

    @Override
    @Transactional
    public TripLogOverviewDTO getSharedTripLog(String token) throws AccessDeniedException {

        Optional<ShareLink> result = shareLinkRepository.findByToken(token);
        ShareLink shareLink = result.orElseThrow();

        if (!shareLink.isActive()) {
            throw new AccessDeniedException("Share Link is inactive.");
        }

        if (shareLink.getExpiredAt() != null && shareLink.getExpiredAt().isBefore(Instant.now())) {
            throw new AccessDeniedException("Share Link has expired.");
        }

        return toOverviewDTO(shareLink.getTripLog());
    }

    @Override
    @Transactional
    public List<TripLogResponseDTO> getList(Long userId) {

        List<TripLog> tripLogs = tripLogRepository.findByUser_Id(userId);

        return tripLogs.stream()
                .map(tripLog -> {
                    TripLogResponseDTO dto = modelMapper.map(tripLog, TripLogResponseDTO.class);
                    dto.setThumbnailPath(normalizePath(dto.getThumbnailPath()));
                    return dto;
                })
                .toList();
    }

    private static final Pattern PATTERN = Pattern.compile("#[a-zA-Z0-9_가-힣]+");

    private List<String> extract(String text) {
        return PATTERN.matcher(text)
                .results()
                .map(m -> m.group().substring(1))
                .toList();
    }

    private String normalizePath(String path) {
        if (path == null) {
            return null;
        }

        return path.replace("\\", "/");
    }

    private TripLogOverviewDTO toOverviewDTO(TripLog tripLog) {
        Long tno = tripLog.getTno();

        List<SpotDetailDTO> spots = spotService.getSpotDetailDTOsByTno(tno);

        return TripLogOverviewDTO.builder()
                .tno(tno)
                .title(tripLog.getTitle())
                .startDate(tripLog.getStartDate())
                .endDate(tripLog.getEndDate())
                .spots(spots)
                .build();
    }
}
