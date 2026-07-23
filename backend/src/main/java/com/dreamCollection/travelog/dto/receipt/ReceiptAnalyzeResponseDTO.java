package com.dreamCollection.travelog.dto.receipt;

import java.util.List;

public record ReceiptAnalyzeResponseDTO(
        List<ReceiptResultDTO> results
) {
}
