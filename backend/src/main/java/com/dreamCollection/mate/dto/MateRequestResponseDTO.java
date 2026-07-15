package com.dreamCollection.mate.dto;

import com.dreamCollection.mate.entity.MateRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@AllArgsConstructor
@Getter
public class MateRequestResponseDTO {
    private final Long id;
    private final Long matePostId;
    private final Long requesterId;
    private final String status;
    private final String message;
    private final LocalDateTime createdAt;

    public static MateRequestResponseDTO from(MateRequest request){
        return new MateRequestResponseDTO(
                request.getId(), request.getMatePostId(), request.getRequesterId(),
                request.getStatus(), request.getMessage(), request.getCreatedAt()
        );
    }
}