package com.dreamCollection.mate.excpetion;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class MateReviewNotAllowedException extends BusinessException {
    public MateReviewNotAllowedException() {
        super("함께 여행한 메이트에게만 후기를 남길 수 있습니다.", HttpStatus.FORBIDDEN);
    }
}