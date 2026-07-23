package com.dreamCollection.travelog.service.client;

import com.dreamCollection.travelog.dto.receipt.ReceiptAnalyzeRequestDTO;
import com.dreamCollection.travelog.dto.receipt.ReceiptAnalyzeResponseDTO;
import org.springframework.transaction.annotation.Transactional;

@Transactional
public interface ReceiptAiClient {

    ReceiptAnalyzeResponseDTO analyze(ReceiptAnalyzeRequestDTO request);
}
