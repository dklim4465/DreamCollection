package com.dreamCollection.travelog.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamCollection.travelog.entity.LogPhoto;

public interface LogPhotoRepository extends JpaRepository<LogPhoto, Long> {
    List<LogPhoto> findByLogIdOrderByTakenAtAsc(Long logId);
}
