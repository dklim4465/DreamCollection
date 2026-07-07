package com.dreamCollection.travelog.dto.upload;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class UploadResultDTO {

    private int totalCount;

    private int successCount;

    private int failCount;

    private List<String> failedFiles;
}
