package com.dreamcollection.domain.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamcollection.domain.main.entity.Banner;

public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByActiveTrueOrderByDisplayOrderAsc();
}
