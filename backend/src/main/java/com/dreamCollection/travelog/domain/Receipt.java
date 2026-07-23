package com.dreamCollection.travelog.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
@ToString
@Table(name = "receipt")
public class Receipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rno;

    @OneToOne
    private Media media;

    private String merchant;

    private Instant paidAt;

    private Long amount;

    private String currency;

    @Column(precision = 19, scale = 2)
    private BigDecimal exchangeRate;

    private Long amountKrw;

    private String ocrText;

    private float confidence;
}
