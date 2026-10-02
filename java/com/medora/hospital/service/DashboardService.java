package com.medora.hospital.service;

import com.medora.hospital.dto.AppointmentResponse;
import com.medora.hospital.dto.DashboardStatsResponse;
import com.medora.hospital.model.Appointment;
import com.medora.hospital.model.Patient;
import com.medora.hospital.repository.AppointmentRepository;
import com.medora.hospital.repository.DoctorRepository;
import com.medora.hospital.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final AppointmentService appointmentService;

    public DashboardService(PatientRepository patientRepository,
                            DoctorRepository doctorRepository,
                            AppointmentRepository appointmentRepository,
                            AppointmentService appointmentService) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.appointmentService = appointmentService;
    }

    public DashboardStatsResponse getStats() {
        LocalDate today = LocalDate.now();
        DashboardStatsResponse stats = new DashboardStatsResponse();
        stats.setTotalPatients(patientRepository.count());
        stats.setTotalDoctors(doctorRepository.count());
        stats.setTodayAppointments(appointmentRepository.countByDate(today));
        stats.setPendingAppointments(appointmentRepository.countByStatus("Scheduled"));

        List<AppointmentResponse> recent = appointmentRepository.findAll().stream()
                .sorted(Comparator.comparing(Appointment::getDate, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Appointment::getTime, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(8)
                .map(appointmentService::toResponse)
                .collect(Collectors.toList());
        stats.setRecentAppointments(recent);

        Map<String, Long> breakdown = new LinkedHashMap<>();
        breakdown.put("Scheduled", appointmentRepository.countByStatus("Scheduled"));
        breakdown.put("Completed", appointmentRepository.countByStatus("Completed"));
        breakdown.put("Cancelled", appointmentRepository.countByStatus("Cancelled"));
        stats.setAppointmentStatusBreakdown(breakdown);

        stats.setWeeklyAppointments(buildWeeklyAppointments());
        stats.setPatientRegistrationTrend(buildPatientTrend());
        return stats;
    }

    private List<DashboardStatsResponse.WeeklyCount> buildWeeklyAppointments() {
        LocalDate start = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        List<DashboardStatsResponse.WeeklyCount> result = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate day = start.plusDays(i);
            String label = day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            long count = appointmentRepository.countByDate(day);
            result.add(new DashboardStatsResponse.WeeklyCount(label, count));
        }
        return result;
    }

    private List<DashboardStatsResponse.WeeklyCount> buildPatientTrend() {
        List<Patient> patients = patientRepository.findAll();
        LocalDate today = LocalDate.now();
        List<DashboardStatsResponse.WeeklyCount> result = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            long count = patients.stream()
                    .filter(p -> p.getDateRegistered() != null && !p.getDateRegistered().isAfter(day))
                    .count();
            String label = day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            result.add(new DashboardStatsResponse.WeeklyCount(label, count));
        }
        return result;
    }
}
