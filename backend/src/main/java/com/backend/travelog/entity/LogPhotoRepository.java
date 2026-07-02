package com.backend.travelog;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LogPhotoRepository extends JpaRepository<LogPhoto, Long> {
    List<LogPhoto> findByLogIdOrderByTakenAtAsc(Long logId);
}
