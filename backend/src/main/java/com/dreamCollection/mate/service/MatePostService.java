package com.dreamCollection.mate.service;

import com.dreamCollection.mate.dto.MatePostCreateRequestDTO;
import com.dreamCollection.mate.dto.MatePostDetailResponseDTO;
import com.dreamCollection.mate.dto.MatePostListResponseDTO;
import com.dreamCollection.mate.dto.MatePostUpdateRequestDTO;
import com.dreamCollection.mate.entity.MatePost;
import com.dreamCollection.mate.excpetion.MatePostAccessDeniedException;
import com.dreamCollection.mate.excpetion.MatePostNotFoundException;
import com.dreamCollection.mate.repository.MatePostRepository;
import com.dreamCollection.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MatePostService {
    private final MatePostRepository matePostRepository;
    private final UserRepository userRepository;

    @Transactional
    public MatePostDetailResponseDTO createPost(Long userId, MatePostCreateRequestDTO requestDTO){
        MatePost post = MatePost.builder()
                .userId(userId)
                .cityId(requestDTO.getCityId())
                .destination(requestDTO.getDestination())
                .startDate(requestDTO.getStartDate())
                .endDate(requestDTO.getEndDate())
                .content(requestDTO.getContent())
                .preferredAge(requestDTO.getPreferredAge())
                .preferredGender(requestDTO.getPreferredGender())
                .travelStyle(requestDTO.getTravelStyle())
                .recruitCount(requestDTO.getRecruitCount())
                .build();

        MatePost saved = matePostRepository.save(post);
        return MatePostDetailResponseDTO.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<MatePostListResponseDTO> getPostList(String status, Pageable pageable){
        Page<MatePost> posts;
        if ("ALL".equals(status)) {
            posts = matePostRepository.findByStatusNotOrderByCreatedAtDesc("DM", pageable);
        } else {
            posts = matePostRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        }
        return posts.map(post -> {
            String nickname = userRepository.findById(post.getUserId())
                    .map(u -> u.getNickname())
                    .orElse("알 수 없음");
            return MatePostListResponseDTO.from(post, nickname);
        });
    }

    @Transactional(readOnly = true)
    public MatePostDetailResponseDTO getPostDetail(Long matePostId){
        MatePost post = findPostOrThrow(matePostId);
        return MatePostDetailResponseDTO.from(post);
    }

    @Transactional
    public MatePostDetailResponseDTO updatePost(Long userId, Long matePostId, MatePostUpdateRequestDTO requestDTO){
        MatePost post = findPostOrThrow(matePostId);
        validateOwner(post,userId);

        post.setDestination(requestDTO.getDestination());
        post.setStartDate(requestDTO.getStartDate());
        post.setEndDate(requestDTO.getEndDate());
        post.setContent(requestDTO.getContent());
        post.setPreferredAge(requestDTO.getPreferredAge());
        post.setPreferredGender(requestDTO.getPreferredGender());
        post.setTravelStyle(requestDTO.getTravelStyle());

        if(requestDTO.getStatus()!=null){
            post.setStatus(requestDTO.getStatus());
        }
        return MatePostDetailResponseDTO.from(post);
    }

    @Transactional
    public void deletePost(Long userId, Long matePostId){
        MatePost post = findPostOrThrow(matePostId);
        validateOwner(post,userId);
        matePostRepository.delete(post);
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