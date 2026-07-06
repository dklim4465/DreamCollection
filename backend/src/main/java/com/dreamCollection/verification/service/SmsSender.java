package com.dreamCollection.verification.service;

/**
 * SMS 발송 추상화.
 * TODO: 실제 서비스에서는 NHN Cloud SMS, 알리고, Twilio 등의 구현체로 교체.
 *       지금은 콘솔 로그로 대체하는 Mock 구현체(MockSmsSender)만 등록되어 있음.
 */
public interface SmsSender {
    void send(String phone, String message);
}
