package com.medora.hospital.repository;

import com.medora.hospital.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends MongoRepository<Appointment, String> {

    List<Appointment> findByPatientId(String patientId);

    List<Appointment> findByDoctorId(String doctorId);

    List<Appointment> findByDate(LocalDate date);

    List<Appointment> findByStatus(String status);

    List<Appointment> findByDateAndStatus(LocalDate date, String status);

    long countByDate(LocalDate date);

    long countByStatus(String status);
}
