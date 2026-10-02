package com.medora.hospital.repository;

import com.medora.hospital.model.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends MongoRepository<Doctor, String> {

    Optional<Doctor> findByDoctorId(String doctorId);

    @Query("{ '$or': [ " +
            "{ 'fullName': { $regex: ?0, $options: 'i' } }, " +
            "{ 'specialization': { $regex: ?0, $options: 'i' } }, " +
            "{ 'doctorId': { $regex: ?0, $options: 'i' } } ] }")
    List<Doctor> search(String query);
}
