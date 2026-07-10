package com.dreamCollection.accommodation.service;

import com.dreamCollection.accommodation.dto.AccommodationRequestDTO;
import com.dreamCollection.accommodation.dto.AccommodationResponseDTO;
import com.dreamCollection.accommodation.entity.Accommodation;
import com.dreamCollection.accommodation.exception.AccommodationValidator;
import com.dreamCollection.accommodation.repository.AccommodationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Log4j2
@RequiredArgsConstructor
public class AccommodationServiceImpl implements AccommodationService{

    private final AccommodationRepository accommodationRepository;
    private final AccommodationValidator accommodationValidator;

    @Override
    public List<AccommodationResponseDTO> searchAccommodations(AccommodationRequestDTO requestDTO) {

        accommodationValidator.validateSearch(requestDTO);

        return accommodationRepository.findByRegionAndCityNameOrderByDisplayOrderAsc(
                        requestDTO.getRegion(),
                        requestDTO.getDestination()
                )
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }
    private AccommodationResponseDTO toResponseDTO(Accommodation accommodation){
        return AccommodationResponseDTO.builder()
                .accommodationId(accommodation.getId())
                .accommodationName(accommodation.getAccommodationName())
                .accommodationType(accommodation.getAccommodationType())
                .cityName(accommodation.getCityName())
                .countryName(accommodation.getCountryName())
                .region(accommodation.getRegion())
                .address(accommodation.getAddress())
                .price(accommodation.getPrice())
                .currency(accommodation.getCurrency())
                .rating(accommodation.getRating())
                .provider(accommodation.getProvider())
                .externalUrl(accommodation.getExternalUrl())
                .imageUrl(accommodation.getImageUrl())
                .build();
    }

}
