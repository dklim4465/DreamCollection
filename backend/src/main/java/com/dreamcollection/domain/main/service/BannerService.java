package com.dreamcollection.domain.main.service;

import com.dreamcollection.domain.admin.dto.BannerAdminRequest;
import com.dreamcollection.domain.main.dto.BannerResponse;
import com.dreamcollection.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Comparator;

import com.dreamcollection.domain.main.entity.Banner;
import com.dreamcollection.domain.main.repository.BannerRepository;

@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;

    @Transactional(readOnly = true)
    public List<BannerResponse> getActiveBanners() {
        return bannerRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .map(BannerResponse::from)
                .toList();
    }

    // ── 관리자 ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<BannerResponse> getAllForAdmin() {
        return bannerRepository.findAll().stream()
                .sorted(Comparator.comparing(Banner::getDisplayOrder))
                .map(BannerResponse::from)
                .toList();
    }

    @Transactional
    public BannerResponse create(Long adminId, BannerAdminRequest request) {
        Banner banner = Banner.builder()
                .adminId(adminId)
                .title(request.title())
                .imageUrl(request.imageUrl())
                .linkUrl(request.linkUrl())
                .displayOrder(request.displayOrder())
                .build();
        return BannerResponse.from(bannerRepository.save(banner));
    }

    @Transactional
    public BannerResponse update(Long id, BannerAdminRequest request) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new BusinessException("배너를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        banner.setTitle(request.title());
        banner.setImageUrl(request.imageUrl());
        banner.setLinkUrl(request.linkUrl());
        if (request.displayOrder() != null) banner.setDisplayOrder(request.displayOrder());
        if (request.active() != null) banner.setActive(request.active());

        return BannerResponse.from(banner);
    }

    @Transactional
    public void delete(Long id) {
        if (!bannerRepository.existsById(id)) {
            throw new BusinessException("배너를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
        }
        bannerRepository.deleteById(id);
    }
}
