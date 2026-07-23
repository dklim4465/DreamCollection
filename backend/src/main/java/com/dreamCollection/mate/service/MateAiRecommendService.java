package com.dreamCollection.mate.service;

import com.dreamCollection.mate.ai.MateAiServerClient;
import com.dreamCollection.mate.dto.MateRecommendItemDTO;
import com.dreamCollection.mate.dto.MateRecommendResponseDTO;
import com.dreamCollection.mate.entity.MatePost;
import com.dreamCollection.mate.repository.MatePostRepository;
import com.dreamCollection.user.entity.User;
import com.dreamCollection.user.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MateAiRecommendService {

    private static final int CANDIDATE_LIMIT = 30;
    private static final int RECOMMEND_LIMIT = 5;

    private final MatePostRepository matePostRepository;
    private final UserRepository userRepository;
    private final MateAiServerClient mateAiServerClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MateRecommendResponseDTO recommend(Long userId) {
        User me = userRepository.findById(userId).orElse(null);
        String myStyle = (me != null && me.getTravelStyle() != null)
                ? me.getTravelStyle().name()
                : "UNKNOWN";

        List<MatePost> candidates = matePostRepository
                .findByStatusOrderByCreatedAtDesc("RECRUITING", PageRequest.of(0, CANDIDATE_LIMIT))
                .stream()
                .filter(post -> !post.getUserId().equals(userId))
                .toList();

        if (candidates.isEmpty()) {
            return MateRecommendResponseDTO.of(List.of(), "AI_OK");
        }

        String prompt = buildPrompt(myStyle, candidates);
        String system = """
                너는 여행 메이트 매칭 서비스의 추천 엔진이야. 아래 사용자 성향과 모집글 목록을 보고,
                성향이 잘 맞는 순서대로 최대 %d개를 추천해. 반드시 아래 JSON 배열 형식으로만 답해.
                다른 설명이나 마크다운은 절대 붙이지 마.
                [{"postId": 숫자, "reason": "한 문장 추천 이유"}]
                """.formatted(RECOMMEND_LIMIT);

        String aiText;
        try {
            aiText = mateAiServerClient.generate(prompt, system, "mate_recommend");
        } catch (MateAiServerClient.AiUnavailableException e) {
            String status = e.isRateLimited() ? "AI_RATE_LIMITED" : "AI_ERROR";
            log.warn("AI 추천 실패(status={}), 폴백으로 전환", status);
            return MateRecommendResponseDTO.of(fallbackRecommend(myStyle, candidates), status);
        }

        List<MateRecommendItemDTO> parsed = parseAiResponse(aiText, candidates);
        if (parsed.isEmpty()) {
            return MateRecommendResponseDTO.of(fallbackRecommend(myStyle, candidates), "AI_FALLBACK");
        }
        return MateRecommendResponseDTO.of(parsed, "AI_OK");
    }

    private String buildPrompt(String myStyle, List<MatePost> candidates) {
        StringBuilder sb = new StringBuilder();
        sb.append("사용자 성향: ").append(myStyle).append("\n");
        sb.append("모집글 목록:\n");
        for (MatePost post : candidates) {
            sb.append("- postId=").append(post.getId())
                    .append(", 여행지=").append(post.getDestination())
                    .append(", 모집 성향=").append(post.getTravelStyle())
                    .append(", 기간=").append(post.getStartDate()).append("~").append(post.getEndDate())
                    .append("\n");
        }
        return sb.toString();
    }

    private List<MateRecommendItemDTO> parseAiResponse(String aiText, List<MatePost> candidates) {
        List<MateRecommendItemDTO> result = new ArrayList<>();
        try {
            String cleaned = aiText.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("```json", "").replaceAll("```", "").trim();
            }
            JsonNode arr = objectMapper.readTree(cleaned);
            for (JsonNode item : arr) {
                Long postId = item.path("postId").asLong();
                String reason = item.path("reason").asText("");
                candidates.stream()
                        .filter(post -> post.getId().equals(postId))
                        .findFirst()
                        .ifPresent(post -> result.add(MateRecommendItemDTO.from(post, reason)));
            }
        } catch (Exception e) {
            log.warn("AI 추천 응답 파싱 실패, 폴백으로 전환: {}", aiText);
        }
        return result;
    }

    // ai-server가 죽어있거나 응답 파싱에 실패했을 때 쓰는 단순 규칙 기반 폴백
    private List<MateRecommendItemDTO> fallbackRecommend(String myStyle, List<MatePost> candidates) {
        List<MateRecommendItemDTO> sameStyle = candidates.stream()
                .filter(post -> myStyle.equalsIgnoreCase(post.getTravelStyle()))
                .limit(RECOMMEND_LIMIT)
                .map(post -> MateRecommendItemDTO.from(post, "나와 같은 여행 성향의 모집글이에요."))
                .toList();

        if (!sameStyle.isEmpty()) {
            return sameStyle;
        }

        // 성향이 정확히 일치하는 글이 없으면, 최소한 최신 모집글이라도 보여준다
        // (AI가 죽은 상황에서까지 빈 화면을 보여주지 않기 위한 최후 폴백)
        return candidates.stream()
                .limit(RECOMMEND_LIMIT)
                .map(post -> MateRecommendItemDTO.from(post, "최근 등록된 모집글이에요."))
                .toList();
    }
}