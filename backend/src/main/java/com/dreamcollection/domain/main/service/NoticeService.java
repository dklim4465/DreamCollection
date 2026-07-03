package com.dreamcollection.domain.main.service;

import com.dreamcollection.domain.admin.dto.NoticeAdminRequest;
import com.dreamcollection.domain.main.dto.NoticeResponse;
import com.dreamcollection.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

import com.dreamcollection.domain.main.entity.Notice;
import com.dreamcollection.domain.main.repository.NoticeRepository;

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
