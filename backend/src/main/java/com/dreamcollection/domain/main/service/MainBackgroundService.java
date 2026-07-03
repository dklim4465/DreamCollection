package com.dreamcollection.domain.main.service;

import com.dreamcollection.domain.admin.dto.MainBackgroundAdminRequest;
import com.dreamcollection.domain.main.dto.MainBackgroundResponse;
import com.dreamcollection.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import com.dreamcollection.domain.main.entity.MainBackground;
import com.dreamcollection.domain.main.repository.MainBackgroundRepository;
/**
 * 메인페이지 배경(이미지/영상) 관리.
 * 조회는 MainHeroService가 findByActiveTrue()로 직접 사용하고,
 * 이 서비스는 관리자 CRUD 전용.
 */
@Service
@RequiredArgsConstructor
public class MainBackgroundService {

    private final MainBackgroundRepository mainBackgroundRepository;

    @Transactional(readOnly = true)
    public List<MainBackgroundResponse> getAllForAdmin() {
        return mainBackgroundRepository.findAll().stream()
                .map(MainBackgroundResponse::from)
                .toList();
    }

    @Transactional
    public MainBackgroundResponse create(Long adminId, MainBackgroundAdminRequest request) {
        MainBackground bg = MainBackground.builder()
                .adminId(adminId)
                .mediaType(request.mediaType())
                .mediaUrl(request.mediaUrl())
                .build();
        if (request.active() != null) bg.setActive(request.active());
        return MainBackgroundResponse.from(mainBackgroundRepository.save(bg));
    }

    @Transactional
    public MainBackgroundResponse update(Long id, MainBackgroundAdminRequest request) {
        MainBackground bg = mainBackgroundRepository.findById(id)
                .orElseThrow(() -> new BusinessException("메인 배경을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        if (request.mediaType() != null) bg.setMediaType(request.mediaType());
        bg.setMediaUrl(request.mediaUrl());
        if (request.active() != null) bg.setActive(request.active());

        return MainBackgroundResponse.from(bg);
    }

    @Transactional
    public void delete(Long id) {
        if (!mainBackgroundRepository.existsById(id)) {
            throw new BusinessException("메인 배경을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
        }
        mainBackgroundRepository.deleteById(id);
    }
}
