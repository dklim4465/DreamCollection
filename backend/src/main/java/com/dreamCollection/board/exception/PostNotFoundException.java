package com.dreamCollection.board.exception;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class PostNotFoundException extends BusinessException {
    public PostNotFoundException(){
        super("게시글을 찾을 수 없습니다.",HttpStatus.NOT_FOUND);
    }
}
