package com.dreamCollection.trip.dto.page;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class SavedTripPageRequest {

    private int page = 0;
    private int size = 6;

    /**
     * desc: 최신순 (createdDate DESC)
     * asc: 오래된순 (createdDate ASC)
     * dday: 출발 임박순 (conditions.startDate, 다가오는 일정 먼저)
     */
    private String sort = "desc";

    /** 검색 대상: t=제목, r=지역(조건JSON), h=테마 등 */
    private List<String> types;

    /** 검색어 (OR) */
    private String keyword;

    /** 생성일 필터 (AND) */
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate from;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate to;

    public boolean isDdaySort() {
        return "dday".equalsIgnoreCase(sort);
    }

    public Pageable toPageable() {
        // dday 정렬은 Spec에서 JSON startDate로 처리 (엔티티 컬럼이 아님)
        if (isDdaySort()) {
            return PageRequest.of(page, size);
        }

        Sort.Direction direction = "asc".equalsIgnoreCase(sort)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(direction, "createdDate"));
    }

    public boolean hasKeyword() {
        return keyword != null && !keyword.isBlank();
    }
}
