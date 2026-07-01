package com.dreamcollection.domain.verification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PhoneVerificationRepository extends JpaRepository<PhoneVerification, Long> {

    // 같은 번호로 여러 번 인증 시도할 수 있으므로 가장 최근 것을 확인
    Optional<PhoneVerification> findTopByPhoneOrderByCreatedAtDesc(String phone);
}
