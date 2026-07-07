package com.dreamCollection.travelog.dto;

import java.nio.file.Path;

public record StoredFileDTO (
        String uuid,
        String filename,
        Path path
) {}