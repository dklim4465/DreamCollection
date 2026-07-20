package com.dreamCollection.global.image;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.util.List;

@RestController
@RequestMapping("/api/images")
public class ImageProxyController {

    private static final List<String> ALLOWED_HOSTS = List.of(
            "images.unsplash.com",
            "images.pexels.com"
    );

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/proxy")
    public ResponseEntity<byte[]> proxy(@RequestParam("url") String url) {
        URI uri;
        try {
            uri = new URI(url);
        } catch (URISyntaxException e) {
            return ResponseEntity.badRequest().build();
        }

        if (uri.getHost() == null || !ALLOWED_HOSTS.contains(uri.getHost())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        ResponseEntity<byte[]> upstream;
        try {
            // ⚠ Pexels(images.pexels.com)는 기본 Java User-Agent("Java/21...")로 오는 요청을
            //   차단(403)한다 — Unsplash 사진은 잘 보이는데 Pexels 사진(치앙마이/푸켓/LA/라스베가스)만
            //   깨진 이미지 아이콘으로 나왔던 원인이 이거였음. 일반 브라우저처럼 보이는
            //   User-Agent를 실어 보내서 우회한다.
            HttpHeaders requestHeaders = new HttpHeaders();
            requestHeaders.set(HttpHeaders.USER_AGENT,
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36");
            upstream = restTemplate.exchange(uri, HttpMethod.GET, new HttpEntity<>(requestHeaders), byte[].class);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
        }

        MediaType contentType = upstream.getHeaders().getContentType();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(contentType != null ? contentType : MediaType.IMAGE_JPEG);
        // 어차피 안 변하는 사진이니 브라우저/CDN 캐시를 길게 (프록시 왕복을 매번 반복하지 않도록)
        headers.setCacheControl(CacheControl.maxAge(Duration.ofDays(7)).cachePublic().getHeaderValue());

        return new ResponseEntity<>(upstream.getBody(), headers, HttpStatus.OK);
    }
}
