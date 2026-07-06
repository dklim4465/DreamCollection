package com.dreamCollection.trip.exception;

public class TripSaveException extends RuntimeException{

    public TripSaveException(String message) {
        super(message);
    }
    public TripSaveException(String message,Throwable cause) {
        super(message, cause);
    }
}
