package com.dreamcollection.travelog.service;

import com.dreamcollection.travelog.domain.Media;
import com.dreamcollection.travelog.domain.MediaType;
import com.dreamcollection.travelog.domain.TripLog;
import com.dreamcollection.travelog.dto.MetadataInfoDTO;
import com.dreamcollection.travelog.dto.StoredFileDTO;
import com.dreamcollection.travelog.dto.upload.UploadRequestDTO;
import com.dreamcollection.travelog.dto.upload.UploadResultDTO;
import com.dreamcollection.travelog.repository.MediaRepository;
import com.dreamcollection.travelog.repository.TripLogRepository;
import com.dreamcollection.travelog.service.extractor.MetadataService;
import com.drew.imaging.ImageProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
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

import java.io.File;
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

    @Override
    @Transactional
    public UploadResultDTO upload(UploadRequestDTO request) {

        TripLog tripLog = tripLogRepository.getReferenceById(request.getTripLogTno());

        List<Media> mediaList = new ArrayList<>();
        List<String> failedFiles = new ArrayList<>();

        int successCount = 0;

        for (MultipartFile file : request.getFiles()) {

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

        return UploadResultDTO.builder()
                .totalCount(request.getFiles().size())
                .successCount(successCount)
                .failCount(failedFiles.size())
                .failedFiles(failedFiles)
                .build();
    }

    @Override
    @Transactional
    public void deleteMedia(Long mno) {

        Media media = mediaRepository.findById(mno).orElseThrow();

        String path = media.getMediaPath();

        mediaRepository.delete(media);

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        try {
                            Files.deleteIfExists(Paths.get(path));
                        } catch (IOException e) {
                            log.warn("delete fail", e);
                        }
                    }
                }
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<Resource> view(Long mno) throws MalformedURLException {

        Media media = mediaRepository.findById(mno).orElseThrow();

        Path path = Paths.get(media.getMediaPath());

        Resource resource = new UrlResource(path.toUri());

        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(media.getMimeType()))
                .body(resource);
    }

    private Media createMedia(MultipartFile file, TripLog tripLog) throws IOException, ImageProcessingException {

        MediaType mediaType = determineMediaType(file);

        StoredFileDTO localFile = saveFile(file, tripLog.getTno(), mediaType);

        MetadataInfoDTO metadata = metadataService.extract(mediaType, localFile.path());

        return Media.builder()
                .tripLog(tripLog)
                .mediaType(mediaType)
                .uuid(localFile.uuid())
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

        return new StoredFileDTO(uuid, filename, target);
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
}
