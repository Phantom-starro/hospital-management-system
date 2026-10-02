package com.medora.hospital.repository;

import com.medora.hospital.model.MedicalRecord;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MedicalRecordRepository extends MongoRepository<MedicalRecord, String> {

    List<MedicalRecord> findByPatientIdOrderByDateDesc(String patientId);

    List<MedicalRecord> findByDoctorId(String doctorId);
}
