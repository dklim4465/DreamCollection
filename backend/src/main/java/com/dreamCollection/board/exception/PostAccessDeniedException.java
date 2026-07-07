package com.dreamCollection.board.exception;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class PostAccessDeniedException extends BusinessException {
    public PostAccessDeniedException(){
        super("본인이 작성한 게시글만 수정/삭제할 수 있습니다.", HttpStatus.FORBIDDEN);
    }
}
