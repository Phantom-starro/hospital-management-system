package com.medora.hospital.service;

import com.medora.hospital.repository.AppointmentRepository;
import com.medora.hospital.repository.DoctorRepository;
import com.medora.hospital.repository.MedicalRecordRepository;
import com.medora.hospital.repository.PatientRepository;
import org.springframework.stereotype.Service;

@Service
public class HumanIdService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;

    public HumanIdService(PatientRepository patientRepository,
                          DoctorRepository doctorRepository,
                          AppointmentRepository appointmentRepository,
                          MedicalRecordRepository medicalRecordRepository) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.medicalRecordRepository = medicalRecordRepository;
    }

    public String nextPatientId() {
        return nextId("PT", patientRepository.count());
    }

    public String nextDoctorId() {
        return nextId("DR", doctorRepository.count());
    }

    public String nextAppointmentId() {
        return nextId("APT", appointmentRepository.count());
    }

    public String nextRecordId() {
        return nextId("MR", medicalRecordRepository.count());
    }

    private String nextId(String prefix, long count) {
        return String.format("%s-%04d", prefix, count + 1);
    }
}
