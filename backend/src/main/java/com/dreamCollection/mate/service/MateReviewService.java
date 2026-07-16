package com.dreamCollection.mate.service;

import com.dreamCollection.mate.dto.MateReviewCreateRequestDTO;
import com.dreamCollection.mate.dto.MateReviewResponseDTO;
import com.dreamCollection.mate.entity.MatePost;
import com.dreamCollection.mate.entity.MateReview;
import com.dreamCollection.mate.excpetion.MatePostNotFoundException;
import com.dreamCollection.mate.excpetion.MateReviewNotAllowedException;
import com.dreamCollection.mate.repository.MatePostRepository;
import com.dreamCollection.mate.repository.MateRequestRepository;
import com.dreamCollection.mate.repository.MateReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MateReviewService {
    private final MateReviewRepository mateReviewRepository;
    private final MatePostRepository matePostRepository;
    private final MateRequestRepository mateRequestRepository;

    @Transactional
    public MateReviewResponseDTO createReview(Long reviewerId, MateReviewCreateRequestDTO requestDTO){
        MatePost post = matePostRepository.findById(requestDTO.getMatePostId())
                .orElseThrow(MatePostNotFoundException::new);

        if(post.getStartDate().isAfter(LocalDate.now())){
            throw new MateReviewNotAllowedException();
        }

        Long revieweeId = requestDTO.getRevieweeId();
        boolean isHost = post.getUserId().equals(reviewerId);
        boolean isAcceptedRequester = mateRequestRepository.findByMatePostId(post.getId()).stream()
                .anyMatch(r->r.getRequesterId().equals(reviewerId)&&"ACCEPTED".equals(r.getStatus()));

        if(!isHost && !isAcceptedRequester){
            throw new MateReviewNotAllowedException();
        }

        if(isHost){
            boolean revieweeIsAcceptedRequester = mateRequestRepository.findByMatePostId(post.getId()).stream()
                    .anyMatch(r -> r.getRequesterId().equals(revieweeId) && "ACCEPTED".equals(r.getStatus()));
            if(!revieweeIsAcceptedRequester){
                throw new MateReviewNotAllowedException();
            }
        } else {
            if(!post.getUserId().equals(revieweeId)){
                throw new MateReviewNotAllowedException();
            }
        }

        MateReview review = MateReview.builder()
                .matePostId(requestDTO.getMatePostId())
                .reviewerId(reviewerId)
                .revieweeId(revieweeId)
                .rating(requestDTO.getRating())
                .content(requestDTO.getContent())
                .build();

        MateReview saved = mateReviewRepository.save(review);
        return MateReviewResponseDTO.from(saved);
    }

    @Transactional(readOnly = true)
    public List<MateReviewResponseDTO> getReviewsForUser(Long revieweeId){
        return mateReviewRepository.findByRevieweeId(revieweeId).stream()
                .map(MateReviewResponseDTO::from)
                .toList();
    }
}