package com.medora.hospital.service;

import com.medora.hospital.dto.MedicalRecordResponse;
import com.medora.hospital.exception.BadRequestException;
import com.medora.hospital.exception.ResourceNotFoundException;
import com.medora.hospital.model.MedicalRecord;
import com.medora.hospital.repository.DoctorRepository;
import com.medora.hospital.repository.MedicalRecordRepository;
import com.medora.hospital.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final HumanIdService humanIdService;

    public MedicalRecordService(MedicalRecordRepository medicalRecordRepository,
                                PatientRepository patientRepository,
                                DoctorRepository doctorRepository,
                                HumanIdService humanIdService) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.humanIdService = humanIdService;
    }

    public List<MedicalRecordResponse> findAll(String patientId, String search) {
        List<MedicalRecord> records;
        if (StringUtils.hasText(patientId)) {
            records = medicalRecordRepository.findByPatientIdOrderByDateDesc(patientId);
        } else {
            records = medicalRecordRepository.findAll();
        }
        return records.stream()
                .filter(r -> matchesSearch(r, search))
                .sorted(Comparator.comparing(MedicalRecord::getDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public MedicalRecordResponse findById(String id) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));
        return toResponse(record);
    }

    public MedicalRecordResponse create(MedicalRecord record) {
        validateReferences(record.getPatientId(), record.getDoctorId());
        record.setId(null);
        record.setRecordId(humanIdService.nextRecordId());
        return toResponse(medicalRecordRepository.save(record));
    }

    public MedicalRecordResponse update(String id, MedicalRecord updated) {
        MedicalRecord existing = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));
        validateReferences(updated.getPatientId(), updated.getDoctorId());
        existing.setPatientId(updated.getPatientId());
        existing.setDoctorId(updated.getDoctorId());
        existing.setDate(updated.getDate());
        existing.setDiagnosis(updated.getDiagnosis());
        existing.setTreatment(updated.getTreatment());
        existing.setNotes(updated.getNotes());
        return toResponse(medicalRecordRepository.save(existing));
    }

    public void delete(String id) {
        if (!medicalRecordRepository.existsById(id)) {
            throw new ResourceNotFoundException("Medical record not found");
        }
        medicalRecordRepository.deleteById(id);
    }

    private void validateReferences(String patientId, String doctorId) {
        if (!patientRepository.existsById(patientId)) {
            throw new BadRequestException("Selected patient does not exist");
        }
        if (!doctorRepository.existsById(doctorId)) {
            throw new BadRequestException("Selected doctor does not exist");
        }
    }

    private boolean matchesSearch(MedicalRecord record, String search) {
        if (!StringUtils.hasText(search)) {
            return true;
        }
        String q = search.trim().toLowerCase();
        MedicalRecordResponse response = toResponse(record);
        return (response.getPatientName() != null && response.getPatientName().toLowerCase().contains(q))
                || (response.getDoctorName() != null && response.getDoctorName().toLowerCase().contains(q))
                || (record.getDiagnosis() != null && record.getDiagnosis().toLowerCase().contains(q))
                || (record.getRecordId() != null && record.getRecordId().toLowerCase().contains(q));
    }

    private MedicalRecordResponse toResponse(MedicalRecord record) {
        MedicalRecordResponse response = new MedicalRecordResponse();
        response.setId(record.getId());
        response.setRecordId(record.getRecordId());
        response.setPatientId(record.getPatientId());
        response.setDoctorId(record.getDoctorId());
        response.setDate(record.getDate());
        response.setDiagnosis(record.getDiagnosis());
        response.setTreatment(record.getTreatment());
        response.setNotes(record.getNotes());

        patientRepository.findById(record.getPatientId()).ifPresent(p -> response.setPatientName(p.getFullName()));
        doctorRepository.findById(record.getDoctorId()).ifPresent(d -> response.setDoctorName(d.getFullName()));
        return response;
    }
}
