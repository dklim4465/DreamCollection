package com.dreamCollection.travelog.dto.receipt;

import java.util.List;

public record ReceiptAnalyzeRequestDTO(
        List<ReceiptTargetDTO> medias
) {
}
