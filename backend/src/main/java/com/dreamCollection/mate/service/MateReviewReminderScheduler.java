package com.dreamCollection.mate.service;

import com.dreamCollection.mate.entity.MatePost;
import com.dreamCollection.mate.entity.MateRequest;
import com.dreamCollection.mate.repository.MatePostRepository;
import com.dreamCollection.mate.repository.MateRequestRepository;
import com.dreamCollection.mate.repository.MateReviewRepository;
import com.dreamCollection.social.entity.Notification;
import com.dreamCollection.social.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class MateReviewReminderScheduler {

    private static final String REMINDER_TYPE = "MATE_REVIEW_REMINDER";

    private final MatePostRepository matePostRepository;
    private final MateRequestRepository mateRequestRepository;
    private final MateReviewRepository mateReviewRepository;
    private final NotificationRepository notificationRepository;

    @Scheduled(cron = "0 0 21 * * *")
    @Transactional
    public void sendReviewReminders() {
        List<MatePost> closedPosts = matePostRepository
                .findByStatusAndEndDateBefore("CLOSED", LocalDate.now());

        for (MatePost post : closedPosts) {
            List<Long> acceptedRequesterIds = mateRequestRepository.findByMatePostId(post.getId()).stream()
                    .filter(r -> "ACCEPTED".equals(r.getStatus()))
                    .map(MateRequest::getRequesterId)
                    .toList();

            if (acceptedRequesterIds.isEmpty()) {
                continue;
            }

            remindIfNeeded(post.getUserId(), post.getId());

            for (Long requesterId : acceptedRequesterIds) {
                remindIfNeeded(requesterId, post.getId());
            }
        }

        log.info("메이트 리뷰 리마인더 스케줄러 실행 완료 - 대상 모집글 {}건", closedPosts.size());
    }

    private void remindIfNeeded(Long userId, Long matePostId) {
        boolean alreadyReviewed = mateReviewRepository
                .existsByMatePostIdAndReviewerId(matePostId, userId);
        if (alreadyReviewed) {
            return;
        }

        boolean alreadyReminded = notificationRepository
                .existsByUserIdAndTypeAndTargetId(userId, REMINDER_TYPE, matePostId);
        if (alreadyReminded) {
            return;
        }

        Notification notification = Notification.builder()
                .userId(userId)
                .type(REMINDER_TYPE)
                .targetType("MATE_POST")
                .targetId(matePostId)
                .content("여행은 즐거우셨나요? 함께한 메이트에게 후기를 남겨보세요.")
                .build();
        notificationRepository.save(notification);
    }
}