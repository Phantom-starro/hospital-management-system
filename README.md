# Medora Hospital Management System

A full-stack hospital management application built with Spring Boot and MongoDB. It provides a lightweight healthcare dashboard for managing patients, doctors, appointments, and medical records in a single interface.

## Overview

This project is designed as an academic MVP for hospital operations. It combines a Java backend with a simple frontend UI and a MongoDB data layer to support common healthcare workflows such as patient registration, doctor management, appointment scheduling, and clinical record tracking.

## Features

- Dashboard with summary metrics and quick access actions
- Patient management with create, read, update, and delete operations
- Doctor directory with specialization tracking
- Appointment booking, updating, filtering, and status changes
- Medical records management linked to patients
- Seeded demo data for local development and presentation
- REST API for frontend integration

## Tech Stack

- Java 17
- Spring Boot 3.2.5
- Spring Web
- Spring Data MongoDB
- Spring Validation
- Maven
- MongoDB
- HTML, CSS, and Vanilla JavaScript for the UI

## Architecture

```text
Browser UI
  ↓
Spring Boot REST API
  ↓
Service Layer
  ↓
MongoDB Repository Layer
  ↓
MongoDB database
```

## Project Structure

```text
hospital-management-system/
├── src/
│   ├── main/
│   │   ├── java/com/medora/hospital/
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── exception/
│   │   │   ├── model/
│   │   │   ├── repository/
│   │   │   └── service/
│   │   └── resources/
│   │       ├── static/
│   │       └── application.properties
│   └── test/
├── .env.example
├── .env
├── pom.xml
├── .gitignore
└── README.md
```

## Prerequisites

Before running the application, ensure you have:

- JDK 17 or later
- Maven 3.8+
- MongoDB running locally or a valid MongoDB Atlas connection

## Configuration

The app reads database configuration from environment variables defined in `.env`.

1. Copy the example file:

```bash
copy .env.example .env
```

2. Update the values:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=hospital_management
```

The project uses `spring-dotenv` so values in `.env` are loaded automatically at runtime.

## Running the Project

From the project root, run:

```bash
mvn clean package -DskipTests
mvn spring-boot:run
```

Then open the app in a browser:

```text
http://localhost:8080
```

## API Endpoints

### Patients

- `GET /api/patients`
- `GET /api/patients/{id}`
- `POST /api/patients`
- `PUT /api/patients/{id}`
- `DELETE /api/patients/{id}`

### Doctors

- `GET /api/doctors`
- `GET /api/doctors/{id}`
- `POST /api/doctors`
- `PUT /api/doctors/{id}`
- `DELETE /api/doctors/{id}`

### Appointments

- `GET /api/appointments`
- `GET /api/appointments/{id}`
- `GET /api/appointments/patient/{patientId}`
- `POST /api/appointments`
- `PUT /api/appointments/{id}`
- `PATCH /api/appointments/{id}/status`
- `DELETE /api/appointments/{id}`

### Medical Records

- `GET /api/medical-records`
- `GET /api/medical-records/{id}`
- `POST /api/medical-records`
- `PUT /api/medical-records/{id}`
- `DELETE /api/medical-records/{id}`

### Dashboard

- `GET /api/dashboard/stats`

## Seed Data

On first successful database initialization, the app automatically seeds demo records including:

- patients
- doctors
- appointments
- medical records
- a `seed_markers` collection to prevent duplicate seeding

## Notes

This project is intentionally built as a lightweight, presentation-friendly healthcare system. It is ideal for demos, academic projects, and backend/frontend integration exercises.

## Future Enhancements

- Authentication and role-based access control
- Billing and pharmacy modules
- Notifications and reminders
- Reporting and PDF export
- Automated tests and CI pipeline integration

---

Medora Hospital Management System is built to be easy to run, easy to demo, and easy to extend.
