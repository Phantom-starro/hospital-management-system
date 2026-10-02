package com.medora.hospital.controller;

import com.medora.hospital.dto.MedicalRecordResponse;
import com.medora.hospital.model.MedicalRecord;
import com.medora.hospital.service.MedicalRecordService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    public MedicalRecordController(MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }

    @GetMapping
    public List<MedicalRecordResponse> getAll(
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false) String search) {
        return medicalRecordService.findAll(patientId, search);
    }

    @GetMapping("/{id}")
    public MedicalRecordResponse getById(@PathVariable String id) {
        return medicalRecordService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MedicalRecordResponse create(@Valid @RequestBody MedicalRecord record) {
        return medicalRecordService.create(record);
    }

    @PutMapping("/{id}")
    public MedicalRecordResponse update(@PathVariable String id, @Valid @RequestBody MedicalRecord record) {
        return medicalRecordService.update(id, record);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        medicalRecordService.delete(id);
    }
}
