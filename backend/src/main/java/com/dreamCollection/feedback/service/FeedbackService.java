package com.dreamCollection.feedback.service;

import com.dreamCollection.feedback.dto.FeedbackRequest;
import com.dreamCollection.feedback.entity.Feedback;
import com.dreamCollection.feedback.repository.FeedbackRepository;
import com.dreamCollection.global.exception.BusinessException;
import com.dreamCollection.letter.service.LetterService;
import com.dreamCollection.verification.service.EmailSender;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;

/**
 * 하단 "문의하기"에서 접수된 건의사항/버그신고를 1) DB에 저장(관리자 페이지에서 조회용)하고
 * 2) 관리자 이메일로도 전달한다. 실제 메일 발송은 EmailSender 구현체가 담당(로컬은
 * MockEmailSender로 콘솔에만 출력, mail.provider=smtp로 바꾸면 실제 메일이 감).
 * 관리자가 답변을 남기면(answer) 그 내용을 문의자 이메일로 보내고, 로그인 상태로
 * 접수된 문의였다면(userId 존재) 마이페이지 "편지함"에도 편지 한 통을 남긴다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final EmailSender emailSender;
    private final FeedbackRepository feedbackRepository;
    private final LetterService letterService;

    // application.properties: app.admin-email=${ADMIN_EMAIL:${spring.mail.username}}
    @Value("${app.admin-email}")
    private String adminEmail;

    private static final java.util.Map<String, String> CATEGORY_LABEL = java.util.Map.of(
            "BUG", "버그 신고",
            "SUGGESTION", "건의사항",
            "ETC", "기타 문의"
    );

    @Transactional
    public void submit(FeedbackRequest request, Long userId) {
        // 1) DB에 저장 — 관리자 페이지 "문의 내역"에서 조회 가능
        feedbackRepository.save(Feedback.builder()
                .name(request.name())
                .email(request.email())
                .category(request.category())
                .message(request.message())
                .userId(userId)
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
        log.info("문의 접수: category={}, from={}, userId={}", request.category(), request.email(), userId);
    }

    /**
     * 관리자 답변 처리: 답변 저장 → 문의자 이메일로 발송 → (로그인 사용자였다면) 편지함에 편지 생성
     */
    @Transactional
    public void answer(Long feedbackId, String answerText) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new BusinessException("문의를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        feedback.answer(answerText);

        String categoryLabel = CATEGORY_LABEL.getOrDefault(feedback.getCategory(), feedback.getCategory());
        String subject = "[Dream Collection] 문의하신 내용에 답변이 도착했어요";
        String emailContent = """
                안녕하세요, %s님. 남겨주신 문의(%s)에 대한 답변이에요.

                [문의 내용]
                %s

                [답변]
                %s
                """.formatted(feedback.getName(), categoryLabel, feedback.getMessage(), answerText);

        emailSender.send(feedback.getEmail(), subject, emailContent);

        if (feedback.getUserId() != null) {
            String letterContent = """
                    [문의하신 내용]
                    %s

                    [답변]
                    %s
                    """.formatted(feedback.getMessage(), answerText);

            letterService.create(
                    feedback.getUserId(),
                    "FEEDBACK_ANSWER",
                    feedback.getId(),
                    "[" + categoryLabel + "] 문의하신 내용에 답변이 도착했어요",
                    letterContent
            );
        }

        log.info("문의 답변 처리: id={}, userId={}", feedbackId, feedback.getUserId());
    }
}
