package com.dreamCollection.board.controller;

import com.dreamCollection.board.dto.ImageUploadResponseDTO;
import com.dreamCollection.board.exception.FileUploadFailedException;
import com.dreamCollection.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/board/upload")
@RequiredArgsConstructor
public class BoardImageUploadController {

    @Value("${com.upload.path}")
    private String uploadDir;

    private static final List<String> ALLOWED_EXTENSIONS =
            List.of("jpg", "jpeg", "png", "gif", "webp");

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    @PostMapping
    public ResponseEntity<ApiResponse<ImageUploadResponseDTO>> uploadImage(
            @AuthenticationPrincipal Long userId,
            @RequestParam("file") MultipartFile file
    ) {
        validateFile(file);

        String extension = extractExtension(file.getOriginalFilename());
        String savedFileName = UUID.randomUUID() + "." + extension;

        try {
            Path boardUploadPath = Paths.get(uploadDir, "board");
            Files.createDirectories(boardUploadPath);

            Path targetPath = boardUploadPath.resolve(savedFileName);
            file.transferTo(targetPath);
        } catch (IOException e) {
            throw new FileUploadFailedException();
        }

        String imageUrl = "/upload/board/" + savedFileName;

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(new ImageUploadResponseDTO(imageUrl), "이미지가 업로드되었습니다."));
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileUploadFailedException("업로드할 파일이 없습니다.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileUploadFailedException("파일 크기는 10MB를 넘을 수 없습니다.");
        }
        String extension = extractExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new FileUploadFailedException("이미지 파일(jpg, png, gif, webp)만 업로드할 수 있습니다.");
        }
    }

    private String extractExtension(String originalFilename) {
        if (!StringUtils.hasText(originalFilename) || !originalFilename.contains(".")) {
            throw new FileUploadFailedException("파일 확장자를 확인할 수 없습니다.");
        }
        return originalFilename.substring(originalFilename.lastIndexOf(".") + 1);
    }
}