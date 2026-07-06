package com.dreamCollection.user.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import com.dreamCollection.user.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    boolean existsByNickname(String nickname);

    Optional<User> findByEmail(String email);

    // 관리자 페이지 - 이메일/닉네임 검색 (둘 중 하나라도 포함되면 매치)
    Page<User> findByEmailContainingOrNicknameContaining(String email, String nickname, Pageable pageable);
}
