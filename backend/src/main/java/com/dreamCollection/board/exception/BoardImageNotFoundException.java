package com.dreamCollection.board.exception;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class BoardImageNotFoundException extends BusinessException {
    public BoardImageNotFoundException(){
        super("이미지를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
    }
}
