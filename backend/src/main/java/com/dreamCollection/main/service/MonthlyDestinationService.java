package com.dreamCollection.main.service;

import com.dreamCollection.admin.dto.MonthlyDestinationAdminRequest;
import com.dreamCollection.main.dto.MonthlyDestinationResponse;
import com.dreamCollection.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

import com.dreamCollection.main.entity.MonthlyDestination;
import com.dreamCollection.main.repository.MonthlyDestinationRepository;

@Service
@RequiredArgsConstructor
public class MonthlyDestinationService {

    private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM");

    private final MonthlyDestinationRepository monthlyDestinationRepository;

    @Transactional(readOnly = true)
    public List<MonthlyDestinationResponse> getCurrentMonthDestinations() {
        String currentMonth = LocalDate.now().format(MONTH_FORMAT);
        return monthlyDestinationRepository
                .findByDisplayMonthAndActiveTrueOrderByDisplayOrderAsc(currentMonth).stream()
                .map(MonthlyDestinationResponse::from)
                .toList();
    }

    // ── 관리자 ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<MonthlyDestinationResponse> getAllForAdmin() {
        return monthlyDestinationRepository.findAll().stream()
                .sorted(Comparator.comparing(MonthlyDestination::getDisplayMonth).reversed()
                        .thenComparing(MonthlyDestination::getDisplayOrder))
                .map(MonthlyDestinationResponse::from)
                .toList();
    }

    @Transactional
    public MonthlyDestinationResponse create(Long adminId, MonthlyDestinationAdminRequest request) {
        MonthlyDestination md = MonthlyDestination.builder()
                .adminId(adminId)
                .displayMonth(request.displayMonth())
                .destinationName(request.destinationName())
                .title(request.title())
                .description(request.description())
                .imageUrl(request.imageUrl())
                .linkUrl(request.linkUrl())
                .build();
        if (request.displayOrder() != null) md.setDisplayOrder(request.displayOrder());
        if (request.active() != null) md.setActive(request.active());
        return MonthlyDestinationResponse.from(monthlyDestinationRepository.save(md));
    }

    @Transactional
    public MonthlyDestinationResponse update(Long id, MonthlyDestinationAdminRequest request) {
        MonthlyDestination md = monthlyDestinationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("이달의 여행지를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        md.setDisplayMonth(request.displayMonth());
        md.setDestinationName(request.destinationName());
        md.setTitle(request.title());
        md.setDescription(request.description());
        md.setImageUrl(request.imageUrl());
        md.setLinkUrl(request.linkUrl());
        if (request.displayOrder() != null) md.setDisplayOrder(request.displayOrder());
        if (request.active() != null) md.setActive(request.active());

        return MonthlyDestinationResponse.from(md);
    }

    @Transactional
    public void delete(Long id) {
        if (!monthlyDestinationRepository.existsById(id)) {
            throw new BusinessException("이달의 여행지를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
        }
        monthlyDestinationRepository.deleteById(id);
    }
}
