package com.dreamCollection.letter.service;

import com.dreamCollection.letter.dto.LetterResponse;
import com.dreamCollection.letter.entity.Letter;
import com.dreamCollection.letter.repository.LetterRepository;
import com.dreamCollection.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 마이페이지 "편지함". 지금은 관리자가 문의(Feedback)에 답변했을 때
 * FeedbackService.answer()가 create(...)를 호출해 편지를 하나 만들어준다.
 */
@Service
@RequiredArgsConstructor
public class LetterService {

    private final LetterRepository letterRepository;

    @Transactional
    public Letter create(Long userId, String type, Long sourceId, String title, String content) {
        return letterRepository.save(Letter.builder()
                .userId(userId)
                .type(type)
                .sourceId(sourceId)
                .title(title)
                .content(content)
                .build());
    }

    @Transactional(readOnly = true)
    public Page<LetterResponse> getMyLetters(Long userId, Pageable pageable) {
        return letterRepository.findAllByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(LetterResponse::from);
    }

    @Transactional(readOnly = true)
    public long countUnread(Long userId) {
        return letterRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public LetterResponse getOneAndMarkRead(Long userId, Long letterId) {
        Letter letter = letterRepository.findByIdAndUserId(letterId, userId)
                .orElseThrow(() -> new BusinessException("편지를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        letter.markRead();
        return LetterResponse.from(letter);
    }

    @Transactional
    public void delete(Long userId, Long letterId) {
        letterRepository.findByIdAndUserId(letterId, userId)
                .orElseThrow(() -> new BusinessException("편지를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        letterRepository.deleteByIdAndUserId(letterId, userId);
    }
}
