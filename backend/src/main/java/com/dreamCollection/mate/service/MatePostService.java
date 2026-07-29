package com.dreamCollection.mate.service;

import com.dreamCollection.city.entity.City;
import com.dreamCollection.city.repository.CityRepository;
import com.dreamCollection.mate.dto.AuthorLevelBadgeInfo;
import com.dreamCollection.mate.dto.MatePostCreateRequestDTO;
import com.dreamCollection.mate.dto.MatePostDetailResponseDTO;
import com.dreamCollection.mate.dto.MatePostListResponseDTO;
import com.dreamCollection.mate.dto.MatePostUpdateRequestDTO;
import com.dreamCollection.mate.entity.MatePost;
import com.dreamCollection.mate.exception.MatePostAccessDeniedException;
import com.dreamCollection.mate.exception.MatePostNotFoundException;
import com.dreamCollection.mate.repository.MatePostRepository;
import com.dreamCollection.user.entity.User;
import com.dreamCollection.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MatePostService {
    private final MatePostRepository matePostRepository;
    private final UserRepository userRepository;
    private final CityRepository cityRepository;
    private final MateAuthorLevelBadgeService mateAuthorLevelBadgeService;

    // 목록의 "전체(ALL)" 탭에서 항상 제외해야 하는 숨김 상태들.
    // DM: 채팅용으로만 쓰이는 히든 레코드. DELETED: 소프트 삭제된 글.
    private static final List<String> HIDDEN_STATUSES = List.of("DM", "DELETED");

    @Transactional
    public MatePostDetailResponseDTO createPost(Long userId, MatePostCreateRequestDTO requestDTO){
        // 프론트가 destination을 자유 텍스트로 받기 때문에 cityId가 없다.
        // destination 텍스트에 city.name_ko가 포함되어 있으면 그 도시의 국가 정보를 자동으로 채운다.
        // (예: "호치민" → city 테이블의 "호치민" row → country_code=VN)
        // 여러 도시가 매칭되면 첫 번째 결과를 사용하고, 매칭이 없으면 country는 null로 남는다.
        City city = findCityFromDestination(requestDTO.getDestination());

        MatePost post = MatePost.builder()
                .userId(userId)
                .cityId(city != null ? city.getId() : null)
                .destination(requestDTO.getDestination())
                .countryCode(city != null ? city.getCountryCode() : null)
                .countryName(city != null ? city.getCountryName() : null)
                .startDate(requestDTO.getStartDate())
                .endDate(requestDTO.getEndDate())
                .content(requestDTO.getContent())
                .preferredAge(requestDTO.getPreferredAge())
                .preferredGender(requestDTO.getPreferredGender())
                .travelStyle(requestDTO.getTravelStyle())
                .recruitCount(requestDTO.getRecruitCount())
                .build();

        MatePost saved = matePostRepository.save(post);
        User user = userRepository.findById(userId).orElse(null);
        return MatePostDetailResponseDTO.from(
                saved,
                user != null ? user.getNickname() : "알 수 없음",
                user != null ? user.getProfileImageUrl() : null
        );
    }

    private City findCityFromDestination(String destination) {
        if (destination == null || destination.isBlank()) {
            return null;
        }
        List<City> matched = cityRepository.findByNameKoContainingAndActiveTrue(destination.trim());
        return matched.isEmpty() ? null : matched.get(0);
    }

    @Transactional(readOnly = true)
    public Page<MatePostListResponseDTO> getPostList(String status, String countryCode, Pageable pageable){
        Page<MatePost> posts;
        boolean hasCountry = countryCode != null && !countryCode.isBlank();

        if ("ALL".equals(status)) {
            posts = hasCountry
                    ? matePostRepository.findByStatusNotInAndCountryCodeOrderByCreatedAtDesc(HIDDEN_STATUSES, countryCode, pageable)
                    : matePostRepository.findByStatusNotInOrderByCreatedAtDesc(HIDDEN_STATUSES, pageable);
        } else {
            posts = hasCountry
                    ? matePostRepository.findByStatusAndCountryCodeOrderByCreatedAtDesc(status, countryCode, pageable)
                    : matePostRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        }
        return posts.map(post -> {
            User user = userRepository.findById(post.getUserId()).orElse(null);
            String nickname = user != null ? user.getNickname() : "알 수 없음";
            String profileImageUrl = user != null ? user.getProfileImageUrl() : null;
            AuthorLevelBadgeInfo levelBadgeInfo = mateAuthorLevelBadgeService.resolve(post.getUserId());
            return MatePostListResponseDTO.from(post, nickname, profileImageUrl, levelBadgeInfo);
        });
    }

    @Transactional(readOnly = true)
    public MatePostDetailResponseDTO getPostDetail(Long matePostId){
        MatePost post = findPostOrThrow(matePostId);
        User user = userRepository.findById(post.getUserId()).orElse(null);
        return MatePostDetailResponseDTO.from(
                post,
                user != null ? user.getNickname() : "알 수 없음",
                user != null ? user.getProfileImageUrl() : null
        );
    }

    @Transactional
    public MatePostDetailResponseDTO updatePost(Long userId, Long matePostId, MatePostUpdateRequestDTO requestDTO){
        MatePost post = findPostOrThrow(matePostId);
        validateOwner(post,userId);

        City city = findCityFromDestination(requestDTO.getDestination());

        post.setDestination(requestDTO.getDestination());
        post.setCityId(city != null ? city.getId() : null);
        post.setCountryCode(city != null ? city.getCountryCode() : null);
        post.setCountryName(city != null ? city.getCountryName() : null);
        post.setStartDate(requestDTO.getStartDate());
        post.setEndDate(requestDTO.getEndDate());
        post.setContent(requestDTO.getContent());
        post.setPreferredAge(requestDTO.getPreferredAge());
        post.setPreferredGender(requestDTO.getPreferredGender());
        post.setTravelStyle(requestDTO.getTravelStyle());

        if(requestDTO.getStatus()!=null){
            post.setStatus(requestDTO.getStatus());
        }
        User user = userRepository.findById(post.getUserId()).orElse(null);
        return MatePostDetailResponseDTO.from(
                post,
                user != null ? user.getNickname() : "알 수 없음",
                user != null ? user.getProfileImageUrl() : null
        );
    }

    /**
     * 소프트 삭제 — row는 남기고 status만 DELETED로 바꾼다.
     * 실제로 지우면 chat_room(mate_post_id FK)이 CASCADE로 같이 삭제되면서
     * 그 글로 시작된 채팅방과 채팅 기록까지 사라지기 때문.
     */
    @Transactional
    public void deletePost(Long userId, Long matePostId){
        MatePost post = findPostOrThrow(matePostId);
        validateOwner(post,userId);
        post.markAsDeleted();
    }

    private MatePost findPostOrThrow(Long matePostId){
        return matePostRepository.findById(matePostId)
                .orElseThrow(MatePostNotFoundException::new);
    }

    private void validateOwner(MatePost post, Long userId){
        if(!post.getUserId().equals(userId)){
            throw new MatePostAccessDeniedException();
        }
    }
}