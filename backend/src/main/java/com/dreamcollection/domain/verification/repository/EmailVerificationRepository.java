package com.dreamcollection.domain.verification.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import com.dreamcollection.domain.verification.entity.EmailVerification;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findTopByEmailOrderByCreatedAtDesc(String email);
}
