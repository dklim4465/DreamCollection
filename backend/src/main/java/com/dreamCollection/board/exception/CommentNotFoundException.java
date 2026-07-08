package com.dreamCollection.board.exception;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class CommentNotFoundException extends BusinessException {
    public CommentNotFoundException(){
        super("댓글을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
    }
}
