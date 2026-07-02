package com.backend.verification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PhoneVerificationRepository extends JpaRepository<PhoneVerification, Long> {

    // ê°™ì? ë²ˆí˜¸ë¡??¬ëŸ¬ ë²??¸ì¦ ?œë„?????ˆìœ¼ë¯€ë¡?ê°€??ìµœê·¼ ê²ƒì„ ?•ì¸
    Optional<PhoneVerification> findTopByPhoneOrderByCreatedAtDesc(String phone);
}
