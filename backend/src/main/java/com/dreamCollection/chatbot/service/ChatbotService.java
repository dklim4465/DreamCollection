package com.dreamCollection.chatbot.service;

import com.dreamCollection.chatbot.dto.ChatHistoryItem;
import com.dreamCollection.chatbot.dto.ChatMessageDto;
import com.dreamCollection.chatbot.entity.ChatbotMessage;
import com.dreamCollection.chatbot.client.GeminiChatClient;
import com.dreamCollection.chatbot.repository.ChatbotMessageRepository;
import com.dreamCollection.city.entity.City;
import com.dreamCollection.city.repository.CityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 챗봇 대화를 처리하고, 유저별로 대화 기록을 DB에 남긴다.
 * (예전엔 GeminiChatClient를 컨트롤러에서 바로 호출하고 대화는 프론트 메모리에만 있어서
 *  새로고침하면 사라졌음 — 이제 새 챗봇 패널을 열 때 이전 대화를 이어서 볼 수 있음)
 *
 * 홈 화면 챗봇 패널에 처음 뜨는 "추천 질문 4개"는 Gemini 응답이 느리거나 일시적으로
 * 실패하더라도 항상 바로 답할 수 있어야 하므로, 이 4개는 Gemini를 호출하지 않고
 * 미리 준비해둔 답변(baseline answer)을 즉시 돌려준다. 그 외 자유 질문은 기존처럼
 * Gemini + 사이트 실데이터(SiteContextService) 조합으로 답한다.
 */
@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final GeminiChatClient geminiChatClient;
    private final SiteContextService siteContextService;
    private final ChatbotMessageRepository chatbotMessageRepository;
    private final CityRepository cityRepository;

    // ChatbotWidget.tsx의 SUGGESTED_QUESTIONS와 반드시 문구를 맞출 것
    private static final String Q_POPULAR = "인기 여행지 추천해줘";
    private static final String Q_ITINERARY = "3박4일 일정 짜줘";
    private static final String Q_PACKING = "여행 준비물 알려줘";
    private static final String Q_HOTEL_TIP = "가성비 좋은 숙소 팁?";

    @Transactional
    public String chat(Long userId, List<ChatMessageDto> messages) {
        ChatMessageDto lastUserMessage = messages.get(messages.size() - 1);
        String question = lastUserMessage.content() == null ? "" : lastUserMessage.content().trim();

        String reply = cannedAnswer(question)
                .orElseGet(() -> geminiChatClient.chat(messages, siteContextService.build()));

        chatbotMessageRepository.save(ChatbotMessage.builder()
                .userId(userId)
                .role("user")
                .content(question)
                .build());

        chatbotMessageRepository.save(ChatbotMessage.builder()
                .userId(userId)
                .role("assistant")
                .content(reply)
                .build());

        return reply;
    }

    @Transactional(readOnly = true)
    public List<ChatHistoryItem> getHistory(Long userId) {
        return chatbotMessageRepository.findByUserIdOrderByCreatedAtAsc(userId).stream()
                .map(ChatHistoryItem::from)
                .toList();
    }

    @Transactional
    public void clearHistory(Long userId) {
        chatbotMessageRepository.deleteByUserId(userId);
    }

    private java.util.Optional<String> cannedAnswer(String question) {
        if (question.equals(Q_POPULAR)) return java.util.Optional.of(popularDestinationsAnswer());
        if (question.equals(Q_ITINERARY)) return java.util.Optional.of(ITINERARY_ANSWER);
        if (question.equals(Q_PACKING)) return java.util.Optional.of(PACKING_ANSWER);
        if (question.equals(Q_HOTEL_TIP)) return java.util.Optional.of(HOTEL_TIP_ANSWER);
        return java.util.Optional.empty();
    }

    /** 실제 인기 도시 데이터(city.is_popular) 기준으로 매번 최신 목록을 만들어 답한다. */
    private String popularDestinationsAnswer() {
        Map<String, List<City>> byCountry = cityRepository.findByPopularTrueAndActiveTrueOrderById().stream()
                .collect(Collectors.groupingBy(City::getCountryName, LinkedHashMap::new, Collectors.toList()));

        if (byCountry.isEmpty()) {
            return "지금 등록된 인기 여행지가 아직 없어요. 조금만 기다려주세요!";
        }

        String lines = byCountry.entrySet().stream()
                .map(e -> e.getKey() + ": " + e.getValue().stream()
                        .map(City::getNameKo)
                        .collect(Collectors.joining(", ")))
                .collect(Collectors.joining("\n"));

        return "Dream Collection에서 지금 가장 인기 있는 여행지는 이래요.\n\n" + lines
                + "\n\n검색창에서 나라를 선택하면 대표 도시들을 사진과 함께 볼 수 있고, "
                + "도시를 고르면 바로 그 여행지로 일정 만들기를 시작할 수 있어요!";
    }

    private static final String ITINERARY_ANSWER = """
            3박4일이면 이렇게 짜보는 걸 추천해요.

            1일차: 도착 후 숙소 체크인, 근처 대표 명소 한두 곳과 저녁 식사로 가볍게 시작
            2일차: 그 도시의 대표 랜드마크와 박물관/전통시장 등 핵심 관광지 위주로 하루 종일
            3일차: 조금 여유롭게 로컬 골목이나 카페 투어, 쇼핑, 근교 당일치기 중 하나 선택
            4일차: 마지막 기념품 쇼핑 후 출국

            숙소는 이동 동선을 줄이기 위해 대중교통이 편한 중심가에 잡는 걸 추천해요. 홈 화면에서 여행지를 고르시면, 그 도시에 맞춰 AI가 자동으로 상세 일정을 짜드릴 수 있어요!
            """;

    private static final String PACKING_ANSWER = """
            여행 준비물 핵심만 정리해드릴게요.

            필수: 여권(또는 신분증), 지갑(카드·현금), 스마트폰과 충전기(보조배터리 포함)
            건강: 개인 상비약, 세면도구
            해외여행이라면: 멀티어댑터, 여행자보험
            선택: 보조 가방, 편한 신발, 날씨에 맞는 겉옷

            구체적인 여행지를 알려주시면 그 지역 날씨와 현지 상황에 맞춘 맞춤형 리스트로 더 자세히 안내해드릴게요!
            """;

    private static final String HOTEL_TIP_ANSWER = """
            가성비 좋은 숙소를 찾으려면 이 순서로 확인해보세요.

            1) 여행 목적부터 정하기 — 관광 위주면 중심가, 휴양 위주면 조용한 외곽이 유리해요
            2) 후기 개수와 최신 후기 위주로 보기 — 별점만 높고 후기가 적으면 신뢰도가 낮을 수 있어요
            3) 취소 정책 확인 — 무료 취소가 되는 숙소를 우선순위에 두면 일정 변경에 안전해요
            4) 위치와 대중교통 접근성 — 숙소비를 아끼려다 교통비가 더 나가는 경우가 많아요

            여행지를 알려주시면 그 지역 기준으로 더 구체적인 추천을 도와드릴게요!
            """;
}
