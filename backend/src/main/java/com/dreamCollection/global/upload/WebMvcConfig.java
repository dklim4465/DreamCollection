package com.dreamCollection.global.upload;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * FileStorageService가 저장한 파일(업로드된 이미지)을 /uploads/** 로 서빙하기 위한 정적 리소스 매핑.
 * SecurityConfig의 PUBLIC_URLS에 "/uploads/**"가 등록되어 있어야 인증 없이 접근 가능하다.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        // 문자열로 직접 "file:" + 경로를 이어붙이면 윈도우 경로(백슬래시, 드라이브 문자)에서
        // 잘못된 리소스 위치가 되어 업로드한 이미지가 404로 안 보일 수 있어서, toUri()로 안전하게 변환.
        String location = uploadPath.toUri().toString(); // 예: file:/C:/Users/.../uploads/
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);
    }
}
