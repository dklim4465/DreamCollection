package com.dreamCollection.board.exception;

import com.dreamCollection.global.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class FileUploadFailedException extends BusinessException {

    public FileUploadFailedException() {
        super("파일 업로드에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public FileUploadFailedException(String message) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}