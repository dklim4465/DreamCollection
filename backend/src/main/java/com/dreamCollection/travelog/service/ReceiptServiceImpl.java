package com.dreamCollection.travelog.service;

import com.dreamCollection.travelog.domain.Media;
import com.dreamCollection.travelog.domain.Receipt;
import com.dreamCollection.travelog.dto.receipt.ReceiptAnalyzeRequestDTO;
import com.dreamCollection.travelog.dto.receipt.ReceiptAnalyzeResponseDTO;
import com.dreamCollection.travelog.dto.receipt.ReceiptResultDTO;
import com.dreamCollection.travelog.dto.receipt.ReceiptTargetDTO;
import com.dreamCollection.travelog.repository.MediaRepository;
import com.dreamCollection.travelog.repository.ReceiptRepository;
import com.dreamCollection.travelog.service.client.ReceiptAiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class ReceiptServiceImpl implements  ReceiptService{

    private final ReceiptAiClient receiptAiClient;

    private final MediaRepository mediaRepository;
    private final ReceiptRepository receiptRepository;

    private final ExchangeRateService exchangeRateService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void analyze(Long tno) {

        List<Media> medias = mediaRepository.findReceiptTargetMedia(tno);

        if (medias.isEmpty()) {
            return;
        }

        List<ReceiptTargetDTO> targets = medias.stream()
                .map(media -> new ReceiptTargetDTO(
                        media.getMno(),
                        media.getMediaPath(),
                        media.getStoredFileName()
                ))
                .toList();

        ReceiptAnalyzeRequestDTO request = new ReceiptAnalyzeRequestDTO(targets);

        ReceiptAnalyzeResponseDTO response = receiptAiClient.analyze(request);

        if (response == null || response.results() == null) {
            return;
        }

        // mno -> media 매핑
        Map<Long, Media> mediaMap = medias.stream()
                .collect(Collectors.toMap(
                        Media::getMno, Function.identity()
                ));

        List<Receipt> receipts = new ArrayList<>();

        for (ReceiptResultDTO result : response.results()) {
            Media media = mediaMap.get(result.mno());

            if (media == null) {
                continue;
            }

            Instant paidAt = null;
            BigDecimal exchangeRate = null;
            Long amountKrw = null;

            if (result.paidAt() != null) {

                LocalDateTime localDateTime = LocalDateTime.parse(result.paidAt());

                ZoneId zoneId = ZoneId.of(media.getSpot().getTimezone());

                paidAt = localDateTime.atZone(zoneId).toInstant();

                exchangeRate = exchangeRateService.getRate(result.currency(), paidAt);

                if (result.totalAmount() != null) {
                    amountKrw = exchangeRate
                            .multiply(BigDecimal.valueOf(result.totalAmount()))
                            .setScale(0, RoundingMode.HALF_UP)
                            .longValue();
                }
            }

            Receipt receipt = Receipt.builder()
                    .media(media)
                    .merchant(result.merchant())
                    .paidAt(paidAt)
                    .amount(result.totalAmount())
                    .currency(result.currency())
                    .exchangeRate(exchangeRate)
                    .amountKrw(amountKrw)
                    .ocrText(result.ocrText())
                    .confidence(result.confidence())
                    .build();

            receipts.add(receipt);
        }

        receiptRepository.saveAll(receipts);
    }
}
