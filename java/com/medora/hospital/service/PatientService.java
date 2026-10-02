package com.medora.hospital.service;

import com.medora.hospital.exception.ResourceNotFoundException;
import com.medora.hospital.model.Patient;
import com.medora.hospital.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final HumanIdService humanIdService;

    public PatientService(PatientRepository patientRepository, HumanIdService humanIdService) {
        this.patientRepository = patientRepository;
        this.humanIdService = humanIdService;
    }

    public List<Patient> findAll(String search) {
        List<Patient> patients;
        if (StringUtils.hasText(search)) {
            patients = patientRepository.search(search.trim());
        } else {
            patients = patientRepository.findAll();
        }
        patients.sort(Comparator.comparing(Patient::getDateRegistered, Comparator.nullsLast(Comparator.reverseOrder())));
        return patients;
    }

    public Patient findById(String id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
    }

    public Patient create(Patient patient) {
        patient.setId(null);
        patient.setPatientId(humanIdService.nextPatientId());
        if (patient.getDateRegistered() == null) {
            patient.setDateRegistered(LocalDate.now());
        }
        if (!StringUtils.hasText(patient.getStatus())) {
            patient.setStatus("Active");
        }
        return patientRepository.save(patient);
    }

    public Patient update(String id, Patient updated) {
        Patient existing = findById(id);
        existing.setFullName(updated.getFullName());
        existing.setAge(updated.getAge());
        existing.setGender(updated.getGender());
        existing.setPhone(updated.getPhone());
        existing.setEmail(updated.getEmail());
        existing.setAddress(updated.getAddress());
        if (StringUtils.hasText(updated.getStatus())) {
            existing.setStatus(updated.getStatus());
        }
        return patientRepository.save(existing);
    }

    public void delete(String id) {
        if (!patientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Patient not found");
        }
        patientRepository.deleteById(id);
    }
}
