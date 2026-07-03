package com.dreamcollection.domain.travelog.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamcollection.domain.travelog.entity.LogPhoto;

public interface LogPhotoRepository extends JpaRepository<LogPhoto, Long> {
    List<LogPhoto> findByLogIdOrderByTakenAtAsc(Long logId);
}
