package com.dreamcollection.domain.main.service;

import com.dreamcollection.domain.main.dto.ChecklistItemResponse;
import com.dreamcollection.domain.main.dto.CreateChecklistItemRequest;
import com.dreamcollection.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import com.dreamcollection.domain.main.entity.ChecklistItem;
import com.dreamcollection.domain.main.repository.ChecklistItemRepository;

@Service
@RequiredArgsConstructor
public class ChecklistItemService {

    private final ChecklistItemRepository checklistItemRepository;

    @Transactional(readOnly = true)
    public List<ChecklistItemResponse> getItems(Long requestId) {
        return checklistItemRepository.findByRequestIdOrderByDisplayOrderAsc(requestId).stream()
                .map(ChecklistItemResponse::from)
                .toList();
    }

    @Transactional
    public ChecklistItemResponse create(CreateChecklistItemRequest request) {
        ChecklistItem item = ChecklistItem.builder()
                .requestId(request.requestId())
                .content(request.content())
                .category(request.category())
                .build();
        return ChecklistItemResponse.from(checklistItemRepository.save(item));
    }

    @Transactional
    public ChecklistItemResponse toggle(Long itemId) {
        ChecklistItem item = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new BusinessException("체크리스트 항목을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        item.toggle();
        return ChecklistItemResponse.from(item);
    }
}
