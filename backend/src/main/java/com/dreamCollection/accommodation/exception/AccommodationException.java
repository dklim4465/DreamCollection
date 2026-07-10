package com.dreamCollection.accommodation.exception;

public class AccommodationException extends RuntimeException {

    public AccommodationException(String message) {
        super(message);
    }

    public AccommodationException(String message, Throwable cause) {
        super(message, cause);
    }
}