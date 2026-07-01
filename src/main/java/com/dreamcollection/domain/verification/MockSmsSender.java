package com.dreamcollection.domain.verification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 실제 SMS 연동 전까지 사용하는 Mock 구현체.
 * 개발 중에는 콘솔에 인증번호를 출력해서 확인할 수 있게 함.
 * TODO: 실제 SMS 발급사 연동 시 이 클래스를 실제 구현체로 교체 (@Component 제거 또는 프로필 분리)
 */
@Slf4j
@Component
public class MockSmsSender implements SmsSender {

    @Override
    public void send(String phone, String message) {
        log.info("[MOCK SMS] to={} message={}", phone, message);
    }
}
