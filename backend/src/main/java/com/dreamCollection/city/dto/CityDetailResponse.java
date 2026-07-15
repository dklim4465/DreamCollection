package com.dreamCollection.city.dto;

import com.dreamCollection.city.entity.City;

import java.util.List;

/**
 * 여행지 상세 페이지(/destinations/{id})용 응답.
 * 도시 기본 정보 + 같은 나라의 다른 도시 목록을 함께 내려준다.
 * (사진 갤러리/국가 여행 정보 같은 큐레이션 콘텐츠는 DB가 아니라
 *  프론트 destination/data/destinationInfo.ts에 정적으로 들어있다 —
 *  이 API는 "어떤 도시인지"만 알려주고, 나머지는 프론트에서 매칭한다)
 */
public record CityDetailResponse(
        CityResponse city,
        List<CityResponse> sameCountryCities
) {
    public static CityDetailResponse of(City city, List<City> sameCountryCities) {
        return new CityDetailResponse(
                CityResponse.from(city),
                sameCountryCities.stream().map(CityResponse::from).toList()
        );
    }
}
