package com.medora.hospital.service;

import com.medora.hospital.exception.ResourceNotFoundException;
import com.medora.hospital.model.Doctor;
import com.medora.hospital.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final HumanIdService humanIdService;

    public DoctorService(DoctorRepository doctorRepository, HumanIdService humanIdService) {
        this.doctorRepository = doctorRepository;
        this.humanIdService = humanIdService;
    }

    public List<Doctor> findAll(String search) {
        List<Doctor> doctors;
        if (StringUtils.hasText(search)) {
            doctors = doctorRepository.search(search.trim());
        } else {
            doctors = doctorRepository.findAll();
        }
        doctors.sort(Comparator.comparing(Doctor::getFullName, String.CASE_INSENSITIVE_ORDER));
        return doctors;
    }

    public Doctor findById(String id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
    }

    public Doctor create(Doctor doctor) {
        doctor.setId(null);
        doctor.setDoctorId(humanIdService.nextDoctorId());
        if (!StringUtils.hasText(doctor.getStatus())) {
            doctor.setStatus("Available");
        }
        return doctorRepository.save(doctor);
    }

    public Doctor update(String id, Doctor updated) {
        Doctor existing = findById(id);
        existing.setFullName(updated.getFullName());
        existing.setSpecialization(updated.getSpecialization());
        existing.setPhone(updated.getPhone());
        existing.setEmail(updated.getEmail());
        if (StringUtils.hasText(updated.getStatus())) {
            existing.setStatus(updated.getStatus());
        }
        return doctorRepository.save(existing);
    }

    public void delete(String id) {
        if (!doctorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Doctor not found");
        }
        doctorRepository.deleteById(id);
    }
}
