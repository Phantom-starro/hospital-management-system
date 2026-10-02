package com.medora.hospital.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsResponse {

    private long totalPatients;
    private long totalDoctors;
    private long todayAppointments;
    private long pendingAppointments;
    private List<AppointmentResponse> recentAppointments;
    private Map<String, Long> appointmentStatusBreakdown;
    private List<WeeklyCount> weeklyAppointments;
    private List<WeeklyCount> patientRegistrationTrend;

    public long getTotalPatients() {
        return totalPatients;
    }

    public void setTotalPatients(long totalPatients) {
        this.totalPatients = totalPatients;
    }

    public long getTotalDoctors() {
        return totalDoctors;
    }

    public void setTotalDoctors(long totalDoctors) {
        this.totalDoctors = totalDoctors;
    }

    public long getTodayAppointments() {
        return todayAppointments;
    }

    public void setTodayAppointments(long todayAppointments) {
        this.todayAppointments = todayAppointments;
    }

    public long getPendingAppointments() {
        return pendingAppointments;
    }

    public void setPendingAppointments(long pendingAppointments) {
        this.pendingAppointments = pendingAppointments;
    }

    public List<AppointmentResponse> getRecentAppointments() {
        return recentAppointments;
    }

    public void setRecentAppointments(List<AppointmentResponse> recentAppointments) {
        this.recentAppointments = recentAppointments;
    }

    public Map<String, Long> getAppointmentStatusBreakdown() {
        return appointmentStatusBreakdown;
    }

    public void setAppointmentStatusBreakdown(Map<String, Long> appointmentStatusBreakdown) {
        this.appointmentStatusBreakdown = appointmentStatusBreakdown;
    }

    public List<WeeklyCount> getWeeklyAppointments() {
        return weeklyAppointments;
    }

    public void setWeeklyAppointments(List<WeeklyCount> weeklyAppointments) {
        this.weeklyAppointments = weeklyAppointments;
    }

    public List<WeeklyCount> getPatientRegistrationTrend() {
        return patientRegistrationTrend;
    }

    public void setPatientRegistrationTrend(List<WeeklyCount> patientRegistrationTrend) {
        this.patientRegistrationTrend = patientRegistrationTrend;
    }

    public static class WeeklyCount {
        private String label;
        private long count;

        public WeeklyCount() {
        }

        public WeeklyCount(String label, long count) {
            this.label = label;
            this.count = count;
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public long getCount() {
            return count;
        }

        public void setCount(long count) {
            this.count = count;
        }
    }
}
