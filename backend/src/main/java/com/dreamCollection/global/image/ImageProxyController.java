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

/**
 * 외부 이미지(Unsplash 등)를 서버가 대신 받아와서 그대로 전달해주는 프록시.
 *
 * 왜 필요한가:
 *  - 브라우저 광고 차단 확장 프로그램(uBlock 등) 중 일부가 이미지 CDN(images.unsplash.com 등)에서
 *    페이지 안에 삽입된(<img>) 요청만 골라서 조용히 차단하는 경우가 있음 (주소창 직접 접속은 안 막힘).
 *  - 프론트에서 이 프록시(같은 출처 /api/images/proxy)를 통해서만 이미지를 요청하게 하면,
 *    브라우저 입장에서는 우리 서버로의 평범한 API 호출일 뿐이라 그런 차단을 우회할 수 있음.
 *
 * 보안: 화이트리스트에 있는 호스트만 프록시 허용 (임의 URL을 서버가 대신 요청해주는
 * SSRF성 오남용 방지).
 */
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
