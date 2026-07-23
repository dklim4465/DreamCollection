package com.dreamCollection.travelog.service.client;

import com.dreamCollection.travelog.dto.receipt.ReceiptAnalyzeRequestDTO;
import com.dreamCollection.travelog.dto.receipt.ReceiptAnalyzeResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class ReceiptAiClientImpl implements  ReceiptAiClient {

    private final RestClient aiRestClient;

    @Override
    public ReceiptAnalyzeResponseDTO analyze(ReceiptAnalyzeRequestDTO request) {

        return aiRestClient.post()
                .uri("/api/v1/receipt/analyze")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (req, res) -> {
                    String errorBody = new String(res.getBody().readAllBytes(), StandardCharsets.UTF_8);
                    System.out.println("FastAPI Error Response = " + errorBody);
                    throw new RuntimeException(errorBody);
                })
                .body(ReceiptAnalyzeResponseDTO.class);
    }
}
