package com.medora.hospital.repository;

import com.medora.hospital.model.SeedMarker;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface SeedMarkerRepository extends MongoRepository<SeedMarker, String> {

    Optional<SeedMarker> findByKey(String key);
}
