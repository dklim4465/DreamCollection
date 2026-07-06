package com.dreamCollection.board.exception;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class CommentAccessDeniedException extends BusinessException {
    public CommentAccessDeniedException(){
        super("본인이 작성한 댓글만 삭제할 수 있습니다.", HttpStatus.FORBIDDEN);
    }
}
