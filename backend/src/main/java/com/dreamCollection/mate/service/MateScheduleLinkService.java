package com.dreamCollection.mate.service;


import com.dreamCollection.mate.dto.MateScheduleLinkCreateRequestDTO;
import com.dreamCollection.mate.entity.MatePost;
import com.dreamCollection.mate.entity.MateRequest;
import com.dreamCollection.mate.entity.MateScheduleLink;
import com.dreamCollection.mate.excpetion.*;
import com.dreamCollection.mate.repository.MatePostRepository;
import com.dreamCollection.mate.repository.MateRequestRepository;
import com.dreamCollection.mate.repository.MateScheduleLinkRepository;
import com.dreamCollection.mate.dto.MateScheduleLinkResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MateScheduleLinkService {

    private final MateScheduleLinkRepository mateScheduleLinkRepository;
    private final MatePostRepository matePostRepository;
    private final MateRequestRepository mateRequestRepository;

    @Transactional
    public MateScheduleLinkResponseDTO createLink(Long hostUserId, Long matePostId, MateScheduleLinkCreateRequestDTO requestDTO ){
        MatePost post = matePostRepository.findById(matePostId)
                .orElseThrow(MatePostNotFoundException::new);

        if(!post.getUserId().equals(hostUserId)){
            throw new MatePostAccessDeniedException();
        }
        MateRequest request = mateRequestRepository.findById(requestDTO.getRequestId())
                .orElseThrow(MateRequestNotFoundException::new);

        if(!request.getMatePostId().equals(matePostId)){
            throw new MateRequestNotFoundException();
        }

        if(!"ACCEPTED".equals(request.getStatus())){
            throw new MateRequestNotAcceptedException();
        }
        if(mateScheduleLinkRepository.existsByRequestId(request.getId())){
            throw new DuplicateScheduleLinkException();
        }

        MateScheduleLink link = MateScheduleLink.builder()
                .matePostId(matePostId)
                .requestId(request.getId())
                .build();

        MateScheduleLink saved = mateScheduleLinkRepository.save(link);
        return MateScheduleLinkResponseDTO.from(saved);
    }


    @Transactional(readOnly = true)
    public List<MateScheduleLinkResponseDTO> getLinks(Long matePostId){
        if(!matePostRepository.existsById(matePostId)){
            throw new MatePostNotFoundException();
        }
        return mateScheduleLinkRepository.findByMatePostId(matePostId).stream()
                .map(MateScheduleLinkResponseDTO::from)
                .toList();
    }


    @Transactional
    public void deleteLink(Long hostUserId, Long matePostId, Long linkId){
        MatePost post = matePostRepository.findById(matePostId)
                .orElseThrow(MatePostNotFoundException::new);
        if(!post.getUserId().equals(hostUserId)){
            throw new MatePostAccessDeniedException();
        }

        MateScheduleLink link = mateScheduleLinkRepository.findById(linkId)
                .orElseThrow(ScheduleLinkNotFoundException::new);
        if(!link.getMatePostId().equals(matePostId)){
            throw new ScheduleLinkNotFoundException();
        }
        mateScheduleLinkRepository.delete(link);
    }
}
