package com.dreamcollection.domain.travelog.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamcollection.domain.travelog.entity.Receipt;

public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
    List<Receipt> findByLogId(Long logId);
}
