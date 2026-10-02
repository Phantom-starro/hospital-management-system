package com.medora.hospital.repository;

import com.medora.hospital.model.Patient;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends MongoRepository<Patient, String> {

    Optional<Patient> findByPatientId(String patientId);

    @Query("{ '$or': [ " +
            "{ 'fullName': { $regex: ?0, $options: 'i' } }, " +
            "{ 'patientId': { $regex: ?0, $options: 'i' } }, " +
            "{ 'phone': { $regex: ?0, $options: 'i' } } ] }")
    List<Patient> search(String query);

    long countByStatus(String status);
}
