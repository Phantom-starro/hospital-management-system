package com.medora.hospital.config;

import com.medora.hospital.model.Appointment;
import com.medora.hospital.model.Doctor;
import com.medora.hospital.model.MedicalRecord;
import com.medora.hospital.model.Patient;
import com.medora.hospital.model.SeedMarker;
import com.medora.hospital.repository.AppointmentRepository;
import com.medora.hospital.repository.DoctorRepository;
import com.medora.hospital.repository.MedicalRecordRepository;
import com.medora.hospital.repository.PatientRepository;
import com.medora.hospital.repository.SeedMarkerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final String SEED_KEY = "initial_demo_data_v1";

    private final SeedMarkerRepository seedMarkerRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;

    public DataSeeder(SeedMarkerRepository seedMarkerRepository,
                      PatientRepository patientRepository,
                      DoctorRepository doctorRepository,
                      AppointmentRepository appointmentRepository,
                      MedicalRecordRepository medicalRecordRepository) {
        this.seedMarkerRepository = seedMarkerRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.medicalRecordRepository = medicalRecordRepository;
    }

    @Override
    public void run(String... args) {
        if (seedMarkerRepository.findByKey(SEED_KEY).map(SeedMarker::isSeeded).orElse(false)) {
            return;
        }

        try {
            List<Patient> patients = seedPatients();
            List<Doctor> doctors = seedDoctors();
            seedAppointments(patients, doctors);
            seedMedicalRecords(patients, doctors);

            seedMarkerRepository.save(new SeedMarker(SEED_KEY, true));
            log.info("Demo seed data loaded successfully.");
        } catch (Exception ex) {
            log.warn("Seed data skipped: {}", ex.getMessage());
        }
    }

    private List<Patient> seedPatients() {
        LocalDate today = LocalDate.now();
        List<Patient> patients = new ArrayList<>();
        patients.add(buildPatient("PT-0001", "Adaeze Okonkwo", 28, "Female", "+234 803 112 4455",
                "adaeze.okonkwo@email.com", "12 Victoria Island, Lagos", today.minusDays(45), "Active"));
        patients.add(buildPatient("PT-0002", "Chinedu Eze", 34, "Male", "+234 805 221 8890",
                "chinedu.eze@email.com", "8 GRA Phase 2, Port Harcourt", today.minusDays(40), "Active"));
        patients.add(buildPatient("PT-0003", "Fatima Bello", 22, "Female", "+234 701 998 3344",
                "fatima.bello@email.com", "21 Ahmadu Bello Way, Abuja", today.minusDays(35), "Active"));
        patients.add(buildPatient("PT-0004", "James Mitchell", 41, "Male", "+44 7700 900123",
                "james.mitchell@email.com", "14 Kensington, London", today.minusDays(30), "Active"));
        patients.add(buildPatient("PT-0005", "Amina Yusuf", 19, "Female", "+234 806 554 2211",
                "amina.yusuf@email.com", "3 Ring Road, Kano", today.minusDays(25), "Active"));
        patients.add(buildPatient("PT-0006", "David Okafor", 52, "Male", "+234 802 667 9900",
                "david.okafor@email.com", "5 New Haven, Enugu", today.minusDays(20), "Inactive"));
        patients.add(buildPatient("PT-0007", "Grace Adeyemi", 31, "Female", "+234 809 443 7788",
                "grace.adeyemi@email.com", "17 Bodija, Ibadan", today.minusDays(14), "Active"));
        patients.add(buildPatient("PT-0008", "Emmanuel Nwachukwu", 27, "Male", "+234 810 332 1199",
                "emmanuel.n@email.com", "9 Trans Amadi, Port Harcourt", today.minusDays(10), "Active"));
        patients.add(buildPatient("PT-0009", "Sophie Laurent", 36, "Female", "+33 6 12 34 56 78",
                "sophie.laurent@email.com", "22 Rue de Rivoli, Paris", today.minusDays(6), "Active"));
        patients.add(buildPatient("PT-0010", "Ibrahim Musa", 48, "Male", "+234 803 778 6655",
                "ibrahim.musa@email.com", "2 Maitama, Abuja", today.minusDays(2), "Active"));
        return patientRepository.saveAll(patients);
    }

    private Patient buildPatient(String patientId, String name, int age, String gender, String phone,
                                 String email, String address, LocalDate registered, String status) {
        Patient p = new Patient();
        p.setPatientId(patientId);
        p.setFullName(name);
        p.setAge(age);
        p.setGender(gender);
        p.setPhone(phone);
        p.setEmail(email);
        p.setAddress(address);
        p.setDateRegistered(registered);
        p.setStatus(status);
        return p;
    }

    private List<Doctor> seedDoctors() {
        List<Doctor> doctors = new ArrayList<>();
        doctors.add(buildDoctor("DR-0001", "Dr. Ngozi Ibe", "General Medicine", "+234 803 100 2001",
                "ngozi.ibe@medora.health", "Available"));
        doctors.add(buildDoctor("DR-0002", "Dr. Samuel Adebanjo", "Cardiology", "+234 805 100 2002",
                "samuel.adebanjo@medora.health", "Available"));
        doctors.add(buildDoctor("DR-0003", "Dr. Priya Sharma", "Pediatrics", "+234 701 100 2003",
                "priya.sharma@medora.health", "Available"));
        doctors.add(buildDoctor("DR-0004", "Dr. Michael Chen", "Dentistry", "+234 806 100 2004",
                "michael.chen@medora.health", "On Leave"));
        doctors.add(buildDoctor("DR-0005", "Dr. Halima Garba", "Dermatology", "+234 809 100 2005",
                "halima.garba@medora.health", "Available"));
        doctors.add(buildDoctor("DR-0006", "Dr. Robert Okorie", "Orthopedics", "+234 810 100 2006",
                "robert.okorie@medora.health", "Available"));
        return doctorRepository.saveAll(doctors);
    }

    private Doctor buildDoctor(String doctorId, String name, String specialization, String phone,
                               String email, String status) {
        Doctor d = new Doctor();
        d.setDoctorId(doctorId);
        d.setFullName(name);
        d.setSpecialization(specialization);
        d.setPhone(phone);
        d.setEmail(email);
        d.setStatus(status);
        return d;
    }

    private void seedAppointments(List<Patient> patients, List<Doctor> doctors) {
        LocalDate today = LocalDate.now();
        List<Appointment> appointments = new ArrayList<>();
        appointments.add(buildAppointment("APT-0001", patients.get(0).getId(), doctors.get(1).getId(),
                today, LocalTime.of(9, 0), "Chest discomfort follow-up", "Scheduled"));
        appointments.add(buildAppointment("APT-0002", patients.get(1).getId(), doctors.get(0).getId(),
                today, LocalTime.of(10, 30), "Routine checkup", "Scheduled"));
        appointments.add(buildAppointment("APT-0003", patients.get(2).getId(), doctors.get(2).getId(),
                today, LocalTime.of(14, 0), "Pediatric vaccination", "Scheduled"));
        appointments.add(buildAppointment("APT-0004", patients.get(4).getId(), doctors.get(4).getId(),
                today.plusDays(1), LocalTime.of(11, 0), "Skin rash consultation", "Scheduled"));
        appointments.add(buildAppointment("APT-0005", patients.get(6).getId(), doctors.get(5).getId(),
                today.plusDays(2), LocalTime.of(15, 30), "Knee pain assessment", "Scheduled"));
        appointments.add(buildAppointment("APT-0006", patients.get(3).getId(), doctors.get(1).getId(),
                today.minusDays(1), LocalTime.of(9, 30), "ECG review", "Completed"));
        appointments.add(buildAppointment("APT-0007", patients.get(7).getId(), doctors.get(0).getId(),
                today.minusDays(2), LocalTime.of(13, 0), "Blood pressure monitoring", "Completed"));
        appointments.add(buildAppointment("APT-0008", patients.get(8).getId(), doctors.get(3).getId(),
                today.minusDays(3), LocalTime.of(16, 0), "Dental cleaning", "Completed"));
        appointments.add(buildAppointment("APT-0009", patients.get(5).getId(), doctors.get(5).getId(),
                today.minusDays(4), LocalTime.of(10, 0), "Back pain consultation", "Cancelled"));
        appointments.add(buildAppointment("APT-0010", patients.get(9).getId(), doctors.get(0).getId(),
                today.plusDays(3), LocalTime.of(8, 30), "Diabetes screening", "Scheduled"));
        appointments.add(buildAppointment("APT-0011", patients.get(0).getId(), doctors.get(4).getId(),
                today.minusDays(5), LocalTime.of(12, 0), "Eczema treatment", "Completed"));
        appointments.add(buildAppointment("APT-0012", patients.get(2).getId(), doctors.get(2).getId(),
                today.plusDays(4), LocalTime.of(9, 0), "Growth assessment", "Scheduled"));
        appointmentRepository.saveAll(appointments);
    }

    private Appointment buildAppointment(String appointmentId, String patientId, String doctorId,
                                         LocalDate date, LocalTime time, String reason, String status) {
        Appointment a = new Appointment();
        a.setAppointmentId(appointmentId);
        a.setPatientId(patientId);
        a.setDoctorId(doctorId);
        a.setDate(date);
        a.setTime(time);
        a.setReason(reason);
        a.setStatus(status);
        return a;
    }

    private void seedMedicalRecords(List<Patient> patients, List<Doctor> doctors) {
        LocalDate today = LocalDate.now();
        List<MedicalRecord> records = new ArrayList<>();
        records.add(buildRecord("MR-0001", patients.get(0).getId(), doctors.get(1).getId(), today.minusDays(10),
                "Hypertension Stage 1", "Lifestyle modification, low-sodium diet", "Patient advised weekly BP log"));
        records.add(buildRecord("MR-0002", patients.get(1).getId(), doctors.get(0).getId(), today.minusDays(8),
                "Acute bronchitis", "Rest, hydration, bronchodilator syrup", "Improvement noted after 5 days"));
        records.add(buildRecord("MR-0003", patients.get(2).getId(), doctors.get(2).getId(), today.minusDays(7),
                "Mild anemia", "Iron supplements for 8 weeks", "Repeat CBC in one month"));
        records.add(buildRecord("MR-0004", patients.get(3).getId(), doctors.get(1).getId(), today.minusDays(6),
                "Arrhythmia monitoring", "Beta-blocker adjustment", "Holter monitor scheduled"));
        records.add(buildRecord("MR-0005", patients.get(4).getId(), doctors.get(4).getId(), today.minusDays(5),
                "Contact dermatitis", "Topical corticosteroid cream", "Avoid identified allergen"));
        records.add(buildRecord("MR-0006", patients.get(6).getId(), doctors.get(5).getId(), today.minusDays(4),
                "Patellar tendinitis", "Physiotherapy twice weekly", "Reduce high-impact activity"));
        records.add(buildRecord("MR-0007", patients.get(7).getId(), doctors.get(0).getId(), today.minusDays(3),
                "Type 2 diabetes", "Metformin, dietary counseling", "HbA1c follow-up in 3 months"));
        records.add(buildRecord("MR-0008", patients.get(9).getId(), doctors.get(0).getId(), today.minusDays(1),
                "Hyperlipidemia", "Statin therapy, exercise plan", "Lipid panel in 6 weeks"));
        medicalRecordRepository.saveAll(records);
    }

    private MedicalRecord buildRecord(String recordId, String patientId, String doctorId, LocalDate date,
                                      String diagnosis, String treatment, String notes) {
        MedicalRecord r = new MedicalRecord();
        r.setRecordId(recordId);
        r.setPatientId(patientId);
        r.setDoctorId(doctorId);
        r.setDate(date);
        r.setDiagnosis(diagnosis);
        r.setTreatment(treatment);
        r.setNotes(notes);
        return r;
    }
}
