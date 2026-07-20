package com.dreamCollection.feedback.service;

import com.dreamCollection.feedback.dto.FeedbackRequest;
import com.dreamCollection.feedback.entity.Feedback;
import com.dreamCollection.feedback.repository.FeedbackRepository;
import com.dreamCollection.verification.service.EmailSender;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;

/**
 * 하단 "문의하기"에서 접수된 건의사항/버그신고를 1) DB에 저장(관리자 페이지에서 조회용)하고
 * 2) 관리자 이메일로도 전달한다. 실제 메일 발송은 EmailSender 구현체가 담당(로컬은
 * MockEmailSender로 콘솔에만 출력, mail.provider=smtp로 바꾸면 실제 메일이 감).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final EmailSender emailSender;
    private final FeedbackRepository feedbackRepository;

    // application.properties: app.admin-email=${ADMIN_EMAIL:${spring.mail.username}}
    @Value("${app.admin-email}")
    private String adminEmail;

    private static final java.util.Map<String, String> CATEGORY_LABEL = java.util.Map.of(
            "BUG", "버그 신고",
            "SUGGESTION", "건의사항",
            "ETC", "기타 문의"
    );

    @Transactional
    public void submit(FeedbackRequest request) {
        // 1) DB에 저장 — 관리자 페이지 "문의 내역"에서 조회 가능
        feedbackRepository.save(Feedback.builder()
                .name(request.name())
                .email(request.email())
                .category(request.category())
                .message(request.message())
                .build());

        // 2) 관리자 이메일로도 전달
        String categoryLabel = CATEGORY_LABEL.getOrDefault(request.category(), request.category());
        String subject = "[Dream Collection 문의] " + categoryLabel + " - " + request.name();

        String content = """
                카테고리: %s
                보낸 사람: %s (%s)
                접수 시각: %s

                ----------------------------------------
                %s
                ----------------------------------------

                ※ 답장은 위 이메일 주소로 직접 보내주세요.
                """.formatted(
                        categoryLabel,
                        request.name(),
                        request.email(),
                        java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                        request.message()
                );

        emailSender.send(adminEmail, subject, content);
        log.info("문의 접수: category={}, from={}", request.category(), request.email());
    }
}
