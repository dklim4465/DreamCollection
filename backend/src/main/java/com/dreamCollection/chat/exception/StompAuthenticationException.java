package com.dreamCollection.chat.exception;

public class StompAuthenticationException extends RuntimeException {
    public StompAuthenticationException(String message){
        super(message);
    }
}
