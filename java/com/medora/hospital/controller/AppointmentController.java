package com.medora.hospital.controller;

import com.medora.hospital.dto.AppointmentResponse;
import com.medora.hospital.model.Appointment;
import com.medora.hospital.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public List<AppointmentResponse> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return appointmentService.findAll(search, status, date);
    }

    @GetMapping("/{id}")
    public AppointmentResponse getById(@PathVariable String id) {
        return appointmentService.findById(id);
    }

    @GetMapping("/patient/{patientId}")
    public List<AppointmentResponse> getByPatient(@PathVariable String patientId) {
        return appointmentService.findByPatientId(patientId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentResponse create(@Valid @RequestBody Appointment appointment) {
        return appointmentService.create(appointment);
    }

    @PutMapping("/{id}")
    public AppointmentResponse update(@PathVariable String id, @Valid @RequestBody Appointment appointment) {
        return appointmentService.update(id, appointment);
    }

    @PatchMapping("/{id}/status")
    public AppointmentResponse updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        return appointmentService.updateStatus(id, body.get("status"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        appointmentService.delete(id);
    }
}
