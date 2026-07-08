package com.dreamCollection.admin.controller;

import com.dreamCollection.global.response.ApiResponse;
import com.dreamCollection.global.upload.FileStorageService;
import com.dreamCollection.global.upload.dto.ImageUploadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * 관리자 페이지에서 이미지를 URL 대신 로컬 파일(카카오톡 등으로 받아서 저장해둔 사진)로
 * 등록할 수 있게 해주는 공용 업로드 API.
 * 배너 / 메인배경 / 이달의 여행지 등록 폼에서 공통으로 사용.
 *
 * 프론트: adminImageApi.upload(file) → POST /api/admin/images/upload (multipart/form-data, key="file")
 * 응답으로 받은 url을 그대로 각 등록 폼의 imageUrl/mediaUrl 필드에 채워 넣으면 된다.
 */
@RestController
@RequestMapping("/api/admin/images")
@RequiredArgsConstructor
public class AdminImageUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ApiResponse<ImageUploadResponse> upload(@RequestParam("file") MultipartFile file) {
        String url = fileStorageService.store(file);
        return ApiResponse.ok(new ImageUploadResponse(url), "이미지가 업로드되었습니다.");
    }
}
