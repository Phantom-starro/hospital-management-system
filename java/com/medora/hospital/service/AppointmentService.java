package com.medora.hospital.service;

import com.medora.hospital.dto.AppointmentResponse;
import com.medora.hospital.exception.BadRequestException;
import com.medora.hospital.exception.ResourceNotFoundException;
import com.medora.hospital.model.Appointment;
import com.medora.hospital.model.Doctor;
import com.medora.hospital.model.Patient;
import com.medora.hospital.repository.AppointmentRepository;
import com.medora.hospital.repository.DoctorRepository;
import com.medora.hospital.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final HumanIdService humanIdService;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              PatientRepository patientRepository,
                              DoctorRepository doctorRepository,
                              HumanIdService humanIdService) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.humanIdService = humanIdService;
    }

    public List<AppointmentResponse> findAll(String search, String status, LocalDate date) {
        List<Appointment> appointments = appointmentRepository.findAll();
        return appointments.stream()
                .filter(a -> !StringUtils.hasText(status) || status.equalsIgnoreCase(a.getStatus()))
                .filter(a -> date == null || date.equals(a.getDate()))
                .filter(a -> matchesSearch(a, search))
                .sorted(Comparator.comparing(Appointment::getDate, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Appointment::getTime, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public AppointmentResponse findById(String id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        return toResponse(appointment);
    }

    public List<AppointmentResponse> findByPatientId(String patientId) {
        return appointmentRepository.findByPatientId(patientId).stream()
                .sorted(Comparator.comparing(Appointment::getDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public AppointmentResponse create(Appointment appointment) {
        validateReferences(appointment.getPatientId(), appointment.getDoctorId());
        appointment.setId(null);
        appointment.setAppointmentId(humanIdService.nextAppointmentId());
        if (!StringUtils.hasText(appointment.getStatus())) {
            appointment.setStatus("Scheduled");
        }
        return toResponse(appointmentRepository.save(appointment));
    }

    public AppointmentResponse update(String id, Appointment updated) {
        Appointment existing = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        validateReferences(updated.getPatientId(), updated.getDoctorId());
        existing.setPatientId(updated.getPatientId());
        existing.setDoctorId(updated.getDoctorId());
        existing.setDate(updated.getDate());
        existing.setTime(updated.getTime());
        existing.setReason(updated.getReason());
        if (StringUtils.hasText(updated.getStatus())) {
            existing.setStatus(updated.getStatus());
        }
        return toResponse(appointmentRepository.save(existing));
    }

    public AppointmentResponse updateStatus(String id, String status) {
        if (!List.of("Scheduled", "Completed", "Cancelled").contains(status)) {
            throw new BadRequestException("Invalid appointment status");
        }
        Appointment existing = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        existing.setStatus(status);
        return toResponse(appointmentRepository.save(existing));
    }

    public void delete(String id) {
        if (!appointmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Appointment not found");
        }
        appointmentRepository.deleteById(id);
    }

    private void validateReferences(String patientId, String doctorId) {
        if (!patientRepository.existsById(patientId)) {
            throw new BadRequestException("Selected patient does not exist");
        }
        if (!doctorRepository.existsById(doctorId)) {
            throw new BadRequestException("Selected doctor does not exist");
        }
    }

    private boolean matchesSearch(Appointment appointment, String search) {
        if (!StringUtils.hasText(search)) {
            return true;
        }
        String q = search.trim().toLowerCase();
        AppointmentResponse response = toResponse(appointment);
        return (response.getPatientName() != null && response.getPatientName().toLowerCase().contains(q))
                || (response.getDoctorName() != null && response.getDoctorName().toLowerCase().contains(q))
                || (appointment.getAppointmentId() != null && appointment.getAppointmentId().toLowerCase().contains(q))
                || (appointment.getReason() != null && appointment.getReason().toLowerCase().contains(q));
    }

    public AppointmentResponse toResponse(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setAppointmentId(appointment.getAppointmentId());
        response.setPatientId(appointment.getPatientId());
        response.setDoctorId(appointment.getDoctorId());
        response.setDate(appointment.getDate());
        response.setTime(appointment.getTime());
        response.setReason(appointment.getReason());
        response.setStatus(appointment.getStatus());

        patientRepository.findById(appointment.getPatientId()).ifPresent(p -> response.setPatientName(p.getFullName()));
        doctorRepository.findById(appointment.getDoctorId()).ifPresent(d -> response.setDoctorName(d.getFullName()));
        return response;
    }
}
