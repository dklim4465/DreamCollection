package com.backend.trip.controller;

import com.backend.trip.dto.TripRequestDTO;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class TripRequestController {

    @GetMapping({"/who","/when","/region","/theme","/level"})
    public void choice() {

    }
}
