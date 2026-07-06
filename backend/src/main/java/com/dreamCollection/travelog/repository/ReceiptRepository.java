package com.dreamCollection.travelog.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamCollection.travelog.entity.Receipt;

public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
    List<Receipt> findByLogId(Long logId);
}
