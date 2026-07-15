package com.dreamCollection.main.service;

import com.dreamCollection.admin.dto.NoticeAdminRequest;
import com.dreamCollection.main.dto.NoticeResponse;
import com.dreamCollection.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

import com.dreamCollection.main.entity.Notice;
import com.dreamCollection.main.repository.NoticeRepository;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;

    @Transactional(readOnly = true)
    public List<NoticeResponse> getActiveNotices() {
        return noticeRepository.findByActiveTrueOrderByPinnedDescCreatedAtDesc().stream()
                .map(NoticeResponse::from)
                .toList();
    }

    // 공지 상세 조회 — 볼 때마다 조회수 1 증가 (비활성 공지는 목록에는 안 나오지만 직접 링크로는 조회 허용하지 않음)
    @Transactional
    public NoticeResponse getActiveNoticeDetail(Long id) {
        Notice notice = noticeRepository.findById(id)
                .filter(Notice::isActive)
                .orElseThrow(() -> new BusinessException("공지사항을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        notice.setViewCount(notice.getViewCount() + 1);
        return NoticeResponse.from(notice);
    }

    // ── 관리자 ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<NoticeResponse> getAllForAdmin() {
        return noticeRepository.findAll().stream()
                .sorted(Comparator.comparing(Notice::getCreatedAt).reversed())
                .map(NoticeResponse::from)
                .toList();
    }

    @Transactional
    public NoticeResponse create(Long adminId, NoticeAdminRequest request) {
        Notice notice = Notice.builder()
                .adminId(adminId)
                .title(request.title())
                .content(request.content())
                .build();
        if (Boolean.TRUE.equals(request.pinned())) notice.setPinned(true);
        if (request.active() != null) notice.setActive(request.active());
        return NoticeResponse.from(noticeRepository.save(notice));
    }

    @Transactional
    public NoticeResponse update(Long id, NoticeAdminRequest request) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("공지사항을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        notice.setTitle(request.title());
        notice.setContent(request.content());
        if (request.pinned() != null) notice.setPinned(request.pinned());
        if (request.active() != null) notice.setActive(request.active());

        return NoticeResponse.from(notice);
    }

    @Transactional
    public void delete(Long id) {
        if (!noticeRepository.existsById(id)) {
            throw new BusinessException("공지사항을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
        }
        noticeRepository.deleteById(id);
    }
}
