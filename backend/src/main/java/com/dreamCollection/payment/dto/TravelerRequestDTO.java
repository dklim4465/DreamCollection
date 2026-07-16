package com.dreamCollection.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record TravelerRequestDTO(
        @NotBlank String fullName,
        @NotNull LocalDate birthDate,
        @NotBlank @Pattern(regexp = "[MF]") String gender,
        @NotBlank String passportNumber,
        @NotNull LocalDate passportExpiry,
        String phone,
        boolean representative
) {}