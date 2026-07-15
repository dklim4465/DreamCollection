package com.dreamCollection.global.upload;

import com.dreamCollection.global.exception.InvalidFileException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp");
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );
    private static final int PROFILE_IMAGE_MAX_SIZE = 512;
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
     * 이미지를 원본 그대로 저장하고 접근 가능한 공개 URL을 반환한다.
     * (관리자 배너/메인배경/이달의 여행지 이미지 등록 공용)
     */
    public String store(MultipartFile file) {
        validate(file);

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

    /**
     * 마이페이지 "프로필 사진 변경" 전용 — 업로드된 이미지를 최대 512px로 축소해서
     * JPEG로 통일 저장한다 (원본이 커도 항상 일정 용량 이하로 유지).
     */
    public String storeProfileImage(MultipartFile file) {
        validate(file);

        BufferedImage original;
        try {
            original = ImageIO.read(file.getInputStream());
        } catch (IOException e) {
            throw new InvalidFileException("이미지를 읽을 수 없습니다.");
        }
        if (original == null) {
            throw new InvalidFileException("지원하지 않는 이미지 형식입니다.");
        }

        BufferedImage resized = resize(original, PROFILE_IMAGE_MAX_SIZE);

        String storedFilename = UUID.randomUUID() + ".jpg";
        Path target = storageRoot.resolve(storedFilename);
        try {
            ImageIO.write(resized, "jpg", target.toFile());
        } catch (IOException e) {
            throw new IllegalStateException("파일 저장 중 오류가 발생했습니다.", e);
        }

        return publicBaseUrl + "/uploads/images/" + storedFilename;
    }

    private BufferedImage resize(BufferedImage original, int maxSize) {
        int w = original.getWidth();
        int h = original.getHeight();
        double scale = Math.min(1.0, (double) maxSize / Math.max(w, h));
        int newW = Math.max(1, (int) Math.round(w * scale));
        int newH = Math.max(1, (int) Math.round(h * scale));

        BufferedImage resized = new BufferedImage(newW, newH, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = resized.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.drawImage(original, 0, 0, newW, newH, null);
        g.dispose();
        return resized;
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("업로드할 파일이 없습니다.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new InvalidFileException("이미지 파일(jpg, png, gif, webp)만 업로드할 수 있습니다.");
        }
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