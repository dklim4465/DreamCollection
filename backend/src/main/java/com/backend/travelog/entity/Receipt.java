package com.backend.travelog;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** DB: receipt ?åÏù¥Î∏?Îß§Ìïë (?ÅÏàòÏ¶? OCR ?∏Ïãù Í≤∞Í≥º) */
@Entity
@Table(name = "receipt")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Receipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "log_id", nullable = false)
    private Long logId;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;

    @Column(name = "store_name", length = 100)
    private String storeName;

    @Column(precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "purchased_at")
    private LocalDateTime purchasedAt;

    @Builder
    public Receipt(Long logId, String imageUrl, String storeName, BigDecimal amount, LocalDateTime purchasedAt) {
        this.logId = logId;
        this.imageUrl = imageUrl;
        this.storeName = storeName;
        this.amount = amount;
        this.purchasedAt = purchasedAt;
    }
}
