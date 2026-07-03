package com.dreamcollection.domain.verification.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import com.dreamcollection.domain.verification.entity.PasswordResetToken;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
}
