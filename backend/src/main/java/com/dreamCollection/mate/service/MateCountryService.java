package com.dreamCollection.mate.service;

import com.dreamCollection.mate.dto.CountryResponseDTO;
import com.dreamCollection.mate.repository.MateCountryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MateCountryService {

    private final MateCountryRepository mateCountryRepository;

    @Transactional(readOnly = true)
    public List<CountryResponseDTO> getCountries() {
        return mateCountryRepository.findDistinctCountries();
    }
}