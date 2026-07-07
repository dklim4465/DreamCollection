package com.dreamCollection.admin.service;

import com.dreamCollection.admin.dto.AdminUserResponse;
import com.dreamCollection.user.entity.User;
import com.dreamCollection.user.repository.UserRepository;
import com.dreamCollection.user.entity.UserStatus;
import com.dreamCollection.global.exception.BusinessException;
import com.dreamCollection.global.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponse<AdminUserResponse> getUsers(String keyword, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        var result = StringUtils.hasText(keyword)
                ? userRepository.findByEmailContainingOrNicknameContaining(keyword, keyword, pageable)
                : userRepository.findAll(pageable);

        return PageResponse.from(result.map(AdminUserResponse::from));
    }

    @Transactional
    public AdminUserResponse changeStatus(Long userId, String statusValue) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("회원을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        UserStatus status;
        try {
            status = UserStatus.valueOf(statusValue);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("올바르지 않은 상태값입니다.", HttpStatus.BAD_REQUEST);
        }

        user.changeStatus(status);
        return AdminUserResponse.from(user);
    }
}
