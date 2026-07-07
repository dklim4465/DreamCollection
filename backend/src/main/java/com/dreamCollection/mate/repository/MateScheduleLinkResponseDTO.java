package com.dreamCollection.mate.repository;


import com.dreamCollection.mate.entity.MateScheduleLink;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class MateScheduleLinkResponseDTO {

    private final Long id;
    private final Long matePostId;
    private final Long requestId;
    private final LocalDateTime linkedAt;

    public static MateScheduleLinkResponseDTO from(MateScheduleLink link){
        return new MateScheduleLinkResponseDTO(
                link.getId(), link.getMatePostId(), link.getRequestId(), link.getLinkedAt()
        );
    }
}
