package com.dreamCollection.travelog.service;

import com.dreamCollection.travelog.domain.Media;
import com.dreamCollection.travelog.domain.MediaType;
import com.dreamCollection.travelog.domain.TripLog;
import com.dreamCollection.travelog.dto.GeoJsonPointDTO;
import com.dreamCollection.travelog.dto.MediaDetailDTO;
import com.dreamCollection.travelog.dto.MetadataInfoDTO;
import com.dreamCollection.travelog.dto.StoredFileDTO;
import com.dreamCollection.travelog.dto.upload.UploadResultDTO;
import com.dreamCollection.travelog.repository.MediaRepository;
import com.dreamCollection.travelog.repository.TripLogRepository;
import com.dreamCollection.travelog.service.extractor.MetadataService;
import com.dreamCollection.travelog.util.GeometryUtils;
import com.drew.imaging.ImageProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import net.coobird.thumbnailator.Thumbnailator;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Log4j2
public class MediaServiceImpl implements MediaService {

    @Value("${com.upload.path}")
    private String uploadPath;

    private final TripLogRepository tripLogRepository;
    private final MediaRepository mediaRepository;

    private final MetadataService metadataService;
    private final SpotService spotService;

    private final GeometryUtils geometryUtils;

    @Override
    @Transactional
    public UploadResultDTO upload(Long tno, List<MultipartFile> files) {

        TripLog tripLog = tripLogRepository.getReferenceById(tno);

        List<Media> mediaList = new ArrayList<>();
        List<String> failedFiles = new ArrayList<>();

        int successCount = 0;

        for (MultipartFile file : files) {

            try {
                Media media = createMedia(file, tripLog);

                mediaList.add(media);
                successCount++;

            } catch (Exception e) {

                log.error("upload fail: {}", file.getOriginalFilename(), e);

                failedFiles.add(file.getOriginalFilename());
            }
        }

        mediaRepository.saveAll(mediaList);

        spotService.clusteringSpot(tno);

        return UploadResultDTO.builder()
                .totalCount(files.size())
                .successCount(successCount)
                .failCount(failedFiles.size())
                .failedFiles(failedFiles)
                .build();
    }

    @Override
    @Transactional
    public void deleteMedia(Long mno) {

        Media media = mediaRepository.findById(mno).orElseThrow();

        registerFileDelete(media);

        mediaRepository.delete(media);
    }

    @Override
    @Transactional
    public void deleteAllByTrip(Long tno) {

        List<Media> mediaList = mediaRepository.findByTripLog_Tno(tno);

        mediaList.forEach(this::registerFileDelete);

        mediaRepository.deleteByTripLog_Tno(tno);
    }

    @Override
    @Transactional
    public MediaDetailDTO getMediaDetail(Long mno) {

        Media media = mediaRepository.findById(mno).orElseThrow();

        GeoJsonPointDTO location = geometryUtils.toGeoJson(media.getLocation());

        return MediaDetailDTO.builder()
                .mno(media.getMno())
                .mediaPath(media.getMediaPath())
                .storedFileName(media.getStoredFileName())
                .takenAt(media.getTakenAt())
                .location(location)
                .mediaText(media.getMediaText())
                .build();
    }

    private Media createMedia(MultipartFile file, TripLog tripLog) throws IOException, ImageProcessingException {

        MediaType mediaType = determineMediaType(file);

        StoredFileDTO localFile = saveFile(file, tripLog.getTno(), mediaType);

        Path localPath = localFile.path().resolve(localFile.filename());

        MetadataInfoDTO metadata = metadataService.extract(mediaType, localPath);

        return Media.builder()
                .tripLog(tripLog)
                .mediaType(mediaType)
                .storedFileName(localFile.filename())
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .mediaPath(localFile.path().toString())
                .takenAt(metadata.getTakenAt())
                .location(metadata.getLocation())
                .build();
    }

    private StoredFileDTO saveFile(MultipartFile file, Long tno, MediaType mediaType) throws IOException {

        String extension = FilenameUtils.getExtension(file.getOriginalFilename());

        String uuid = UUID.randomUUID().toString();

        String filename = uuid + '.' + extension;

        Path directory = Paths.get(
                uploadPath, String.valueOf(tno),
                "media", mediaType.name().toLowerCase()
        );

        Files.createDirectories(directory);

        Path target = directory.resolve(filename);

        file.transferTo(target);

        if (mediaType == MediaType.IMAGE) {
            Path thumbDir = Paths.get(
                    uploadPath, String.valueOf(tno),"media",
                    mediaType.name().toLowerCase(), "thumbnail"
            );

            Files.createDirectories(thumbDir);

            Path thumbTarget = thumbDir.resolve(filename);

            Thumbnailator.createThumbnail(target.toFile(), thumbTarget.toFile(), 200, 200);
        }

        return new StoredFileDTO(uuid, filename, directory);
    }

    private MediaType determineMediaType(MultipartFile file) {

        try{
            String contentType =  file.getContentType();

            String majorType = contentType.split("/", 2)[0];

            return switch (majorType) {
                case "text" -> MediaType.TEXT;
                case "image" -> MediaType.IMAGE;
                case "video" -> MediaType.VIDEO;
                case "audio" -> MediaType.AUDIO;
                default -> MediaType.ETC;
            };
        } catch (Exception e) {
            return MediaType.ETC;
        }
    }

    private void registerFileDelete(Media media) {

        boolean isImg = media.getMediaType() == MediaType.IMAGE;

        String path = media.getMediaPath();

        String storedFileName = media.getStoredFileName();

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        try {
                            Files.deleteIfExists(Paths.get(path, storedFileName));

                            if (isImg) {
                                Files.deleteIfExists(Paths.get(path, "thumbnail", storedFileName));
                            }

                        } catch (IOException e) {
                            log.warn("delete fail", e);
                        }
                    }
                }
        );
    }
}
