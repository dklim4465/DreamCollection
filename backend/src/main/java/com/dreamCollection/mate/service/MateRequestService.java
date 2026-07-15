package com.dreamCollection.mate.service;

import com.dreamCollection.mate.excpetion.DuplicateMateRequestException;
import com.dreamCollection.mate.dto.MateRequestDecisionRequestDTO;
import com.dreamCollection.mate.dto.MateRequestResponseDTO;
import com.dreamCollection.mate.entity.MatePost;
import com.dreamCollection.mate.entity.MateRequest;
import com.dreamCollection.mate.excpetion.MatePostAccessDeniedException;
import com.dreamCollection.mate.excpetion.MatePostNotFoundException;
import com.dreamCollection.mate.excpetion.MateRecruitmentClosedException;
import com.dreamCollection.mate.excpetion.MateRequestNotFoundException;
import com.dreamCollection.mate.repository.MatePostRepository;
import com.dreamCollection.mate.repository.MateRequestRepository;
import com.dreamCollection.social.entity.Notification;
import com.dreamCollection.social.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MateRequestService {

    private final MateRequestRepository mateRequestRepository;
    private final MatePostRepository matePostRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public MateRequestResponseDTO applyForMate(Long requesterId, Long matePostId, String message){
        MatePost post = matePostRepository.findById(matePostId)
                .orElseThrow(MatePostNotFoundException::new);

        if(!"RECRUITING".equals(post.getStatus())){
            throw new MateRecruitmentClosedException();
        }
        if(mateRequestRepository.existsByMatePostIdAndRequesterId(matePostId,requesterId)){
            throw new DuplicateMateRequestException();
        }
        MateRequest request = MateRequest.builder()
                .matePostId(matePostId)
                .requesterId(requesterId)
                .message(message)
                .build();

        MateRequest saved = mateRequestRepository.save(request);

        Notification notification = Notification.builder()
                .userId(post.getUserId())
                .type("MATE_REQUEST")
                .targetType("MATE_POST")
                .targetId(matePostId)
                .content("새로운 메이트 신청이 도착했어요.")
                .build();
        notificationRepository.save(notification);

        return MateRequestResponseDTO.from(saved);
    }

    @Transactional(readOnly = true)
    public List<MateRequestResponseDTO> getRequestList(Long hostUserId, Long matePostId){
        MatePost post = matePostRepository.findById(matePostId)
                .orElseThrow(MatePostNotFoundException::new);
        validateHost(post,hostUserId);

        return mateRequestRepository.findByMatePostId(matePostId).stream()
                .map(MateRequestResponseDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MateRequestResponseDTO> getMyRequests(Long requesterId){
        return mateRequestRepository.findByRequesterId(requesterId).stream()
                .map(MateRequestResponseDTO::from)
                .toList();
    }

    @Transactional
    public MateRequestResponseDTO decideRequest(Long hostUserId, Long matePostId, Long requestId,
                                                MateRequestDecisionRequestDTO decisionRequestDTO){
        MatePost post = matePostRepository.findById(matePostId)
                .orElseThrow(MatePostNotFoundException::new);
        validateHost(post,hostUserId);

        MateRequest request = mateRequestRepository.findById(requestId)
                .orElseThrow(MateRequestNotFoundException::new);
        if(!request.getMatePostId().equals(matePostId)){
            throw new MateRequestNotFoundException();
        }
        if("ACCEPT".equals(decisionRequestDTO.getDecision())){
            request.setStatus("ACCEPTED");

            long acceptedCount = mateRequestRepository.countByMatePostIdAndStatus(matePostId,"ACCEPTED");
            if(acceptedCount>=post.getRecruitCount()){
                post.setStatus("CLOSED");
            }

            Notification notification = Notification.builder()
                    .userId(request.getRequesterId())
                    .type("MATE_ACCEPTED")
                    .targetType("MATE_POST")
                    .targetId(matePostId)
                    .content("메이트 신청이 수락되었어요.")
                    .build();
            notificationRepository.save(notification);
        } else{
            request.setStatus("REJECTED");

            Notification notification = Notification.builder()
                    .userId(request.getRequesterId())
                    .type("MATE_REJECTED")
                    .targetType("MATE_POST")
                    .targetId(matePostId)
                    .content("이번 모집에는 참여가 어렵게 되었어요.")
                    .build();
            notificationRepository.save(notification);
        }
        return MateRequestResponseDTO.from(request);
    }

    @Transactional
    public void cancelRequest(Long requesterId, Long matePostId, Long requestId){
        MateRequest request = mateRequestRepository.findById(requestId)
                .orElseThrow(MateRequestNotFoundException::new);
        if(!request.getMatePostId().equals(matePostId)){
            throw new MateRequestNotFoundException();
        }
        if(!request.getRequesterId().equals(requesterId)){
            throw new MatePostAccessDeniedException();
        }
        mateRequestRepository.delete(request);
    }

    private void validateHost(MatePost post, Long userId){
        if(!post.getUserId().equals(userId)){
            throw new MatePostAccessDeniedException();
        }
    }

}