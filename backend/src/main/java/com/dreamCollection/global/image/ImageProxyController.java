package com.dreamCollection.global.image;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
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
            upstream = restTemplate.getForEntity(uri, byte[].class);
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
