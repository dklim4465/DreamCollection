package com.dreamCollection.global.upload;

import com.dreamCollection.global.exception.InvalidFileException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * 관리자 페이지(배너/메인배경/이달의 여행지)에서 이미지를 "URL 직접 입력" 없이
 * 로컬 파일(카카오톡으로 받아서 저장해둔 사진 등)로 업로드할 수 있게 해주는 서비스.
 *
 * 저장 방식: 서버 로컬 디스크(upload.dir 경로)에 저장하고, WebMvcConfig가 등록한
 * 정적 리소스 매핑(/uploads/**)을 통해 공개 URL로 접근 가능하게 함.
 *
 * TODO: 여러 대의 서버로 스케일아웃하게 되면 로컬 디스크 대신 S3 등 오브젝트 스토리지로 교체 필요.
 */
@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp");
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    private final Path storageRoot;
    private final String publicBaseUrl;

    public FileStorageService(
            @Value("${upload.dir:uploads}") String uploadDir,
            @Value("${upload.public-base-url:http://localhost:8080}") String publicBaseUrl
    ) {
        this.storageRoot = Paths.get(uploadDir, "images").toAbsolutePath().normalize();
        this.publicBaseUrl = publicBaseUrl;
        try {
            Files.createDirectories(storageRoot);
        } catch (IOException e) {
            throw new IllegalStateException("업로드 저장 폴더를 생성할 수 없습니다: " + storageRoot, e);
        }
    }

    /**
     * 이미지를 저장하고 접근 가능한 공개 URL을 반환한다.
     * (관리자 배너/메인배경/이달의 여행지 이미지 등록 공용)
     */
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("업로드할 파일이 없습니다.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new InvalidFileException("이미지 파일(jpg, png, gif, webp)만 업로드할 수 있습니다.");
        }

        String extension = extractExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new InvalidFileException("이미지 파일(jpg, png, gif, webp)만 업로드할 수 있습니다.");
        }

        String storedFilename = UUID.randomUUID() + "." + extension.toLowerCase();
        Path target = storageRoot.resolve(storedFilename);

        try {
            file.transferTo(target);
        } catch (IOException e) {
            throw new IllegalStateException("파일 저장 중 오류가 발생했습니다.", e);
        }

        return publicBaseUrl + "/uploads/images/" + storedFilename;
    }

    private String extractExtension(String originalFilename) {
        String cleaned = StringUtils.cleanPath(originalFilename == null ? "" : originalFilename);
        int dotIndex = cleaned.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == cleaned.length() - 1) {
            throw new InvalidFileException("파일 확장자를 확인할 수 없습니다.");
        }
        return cleaned.substring(dotIndex + 1);
    }
}
