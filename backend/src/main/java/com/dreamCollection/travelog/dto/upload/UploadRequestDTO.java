package com.dreamcollection.travelog.dto.upload;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class UploadRequestDTO {

    private Long tripLogTno;

    private List<MultipartFile> files;
}
