---

# Eventify – Full-Stack Event Management Platform

Eventify is a full-stack event management system that enables Admins, Organizers, and Attendees to manage events, registrations, and platform activity through role-based dashboards.

The platform is built using React, Spring Boot, and PostgreSQL, and supports a complete event lifecycle from creation to registration and administration.

---

## Live Demo

Hosted on Vercel: [https://eventify-event-management.vercel.app](https://eventify-event-management.vercel.app)

---

## Features

### Authentication & Security

<img width="1907" height="911" alt="Eventify Login" src="https://github.com/user-attachments/assets/46289f93-8da2-4a9a-a7c0-fcc9db40c2fe" />

* JWT-based authentication
* Role-based access control (Admin, Organizer, Attendee)
* Secure REST APIs using Spring Security
* Protected frontend routes

---

### Admin Dashboard

<img width="1898" height="902" alt="Admni Dashboard" src="https://github.com/user-attachments/assets/93193c13-5e90-4def-abc7-411893640221" />

* View platform statistics (users, events, registrations)
* Create users (Admin, Organizer, Attendee)
* Delete users with safety checks (cannot delete own account)
* View all events and registrations
* Delete events and registrations
* Search, filter, and sort users and events
* Profile management (edit profile and change password)

---

### Organizer Dashboard

<img width="1903" height="908" alt="Organizer Dashboard" src="https://github.com/user-attachments/assets/982d460d-cc6c-4a6d-ab1e-fbac18a1ffac" />

* Create events
* Edit events with validation rules
* Publish, cancel, and republish events
* View event registrations
* Duplicate prevention (title + start time)
* Event lifecycle management
* Search, filter, and sort events

---

### Attendee Dashboard

<img width="1902" height="908" alt="Attendee Dashboard" src="https://github.com/user-attachments/assets/aa775e41-115d-4e17-86d2-590131b13b72" />

* Browse all events
* Search, filter, and sort events
* Register for events
* Cancel registrations
* View personal registrations
* Real-time seat availability updates

---

## Tech Stack

### Frontend

* React (Vite)
* Axios
* Tailwind CSS
* React Router

### Backend

* Java 22
* Spring Boot
* Spring Security (JWT)
* Hibernate / JPA

### Database

* PostgreSQL (Neon)

### Deployment

* Frontend: Vercel
* Backend: Railway

---

## System Architecture

```
Frontend (React)
       ↓
REST API (Spring Boot)
       ↓
PostgreSQL Database (Neon)
```

---

## Environment Variables

### Backend

```
APP_CORS_ALLOWED_ORIGIN=your_frontend_url
DB_URL=your_database_url
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
JWT_SECRET=your_secret
JWT_EXPIRATION=86400000
```

### Frontend

```
VITE_API_URL=your_backend_url/api
```

---

## Running Locally

### Backend

```
cd eventify-backend
./mvnw spring-boot:run
```

### Frontend

```
cd eventify-frontend
npm install
npm run dev
```

---

## Key Highlights

* Multi-role system with real-world workflows
* Event lifecycle management (create, publish, cancel, register)
* Seat tracking with consistency handling
* Duplicate prevention logic for events
* Full CRUD across users, events, and registrations
* Clean UI with filtering and sorting

---

## Author

Mohammed Alfarra
Computer Science Graduate – Florida International University

---
