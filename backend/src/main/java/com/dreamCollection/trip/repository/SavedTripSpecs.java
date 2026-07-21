package com.dreamCollection.trip.repository;

import com.dreamCollection.trip.dto.page.SavedTripPageRequest;
import com.dreamCollection.trip.entity.SavedTrip;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public final class SavedTripSpecs {

    private SavedTripSpecs() {}

    public static Specification<SavedTrip> from(Long userId, SavedTripPageRequest request) {
        return (root, query, cb) -> {
            List<Predicate> ands = new ArrayList<>();

            ands.add(cb.equal(root.get("userId"), userId));

            if (request.hasKeyword()) {
                String pattern = "%" + request.getKeyword().trim().toLowerCase() + "%";
                List<String> types = request.getTypes();
                List<Predicate> ors = new ArrayList<>();

                boolean useTitle = types == null || types.isEmpty() || types.contains("t");
                boolean useRegion = types == null || types.isEmpty() || types.contains("r");
                boolean useTheme = types != null && types.contains("h");

                if (useTitle) {
                    ors.add(cb.like(cb.lower(root.get("recommendationJson")), pattern));
                }
                if (useRegion || useTheme) {
                    ors.add(cb.like(cb.lower(root.get("conditionsJson")), pattern));
                }
                if (ors.isEmpty()) {
                    ors.add(cb.like(cb.lower(root.get("recommendationJson")), pattern));
                    ors.add(cb.like(cb.lower(root.get("conditionsJson")), pattern));
                }

                ands.add(cb.or(ors.toArray(Predicate[]::new)));
            }

            if (request.getFrom() != null) {
                ands.add(cb.greaterThanOrEqualTo(
                        root.get("createdDate"),
                        request.getFrom().atStartOfDay()
                ));
            }
            if (request.getTo() != null) {
                ands.add(cb.lessThan(
                        root.get("createdDate"),
                        request.getTo().plusDays(1).atStartOfDay()
                ));
            }

            // count 쿼리에는 order by 넣지 않음
            boolean isCountQuery = query.getResultType() != null
                    && (Long.class.equals(query.getResultType()) || long.class.equals(query.getResultType()));

            if (!isCountQuery && request.isDdaySort()) {
                // conditions_json -> $.startDate (MariaDB JSON)
                Expression<String> startDate = cb.function(
                        "json_unquote",
                        String.class,
                        cb.function(
                                "json_extract",
                                String.class,
                                root.get("conditionsJson"),
                                cb.literal("$.startDate")
                        )
                );

                String today = LocalDate.now().toString();

                // 0: 오늘 이후(다가옴) / 1: 지난 일정 / 2: 날짜 없음
                Expression<Object> groupOrder = cb.selectCase()
                        .when(cb.or(cb.isNull(startDate), cb.equal(startDate, "")), 2)
                        .when(cb.lessThan(startDate, today), 1)
                        .otherwise(0);

                List<Order> orders = new ArrayList<>();
                orders.add(cb.asc(groupOrder));
                // 다가오는 일정: 출발일 가까운 순
                orders.add(cb.asc(startDate));
                query.orderBy(orders);
            }

            return cb.and(ands.toArray(Predicate[]::new));
        };
    }
}
