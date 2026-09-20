# The Vehicle Service Booking and Tracking System

A full-stack enterprise web application built for the **Database Systems Engineering and Distributed Backend Development (25CS1302E)** course.

## Team Details
- **Course**: DATABASE SYSTEMS ENGINEERING AND DISTRIBUTED BACKEND DEVELOPMENT (25CS1302E)
- **Section**: Sec No-2 | **Team**: Team No-24
- **Students**:
  - **Revanth Reddy** (Roll: `2520030424`)
  - **Subhash** (Roll: `2520030391`)

---

## Technology Stack

| Layer | Framework / Technology |
|---|---|
| **Frontend** | React 18, Vite, Lucide Icons, Canvas Confetti, Modern CSS Design System |
| **Backend** | Node.js, Express.js REST API, JSON Web Tokens (JWT), Bcrypt.js |
| **Database** | MySQL 8.0 Relational Engine with Transactions, Foreign Keys, Cascades |
| **Notifications** | SMS Gateway logger + Nodemailer Email dispatcher with DB persistence |
| **Security** | Role-Based Access Control (`customer`, `staff`, `admin`), Prepared Statements |

---

## ⚡ System Accounts & Login Credentials

| Role | Name | Email | Password |
|---|---|---|---|
| **Administrator** | Rajesh Varma (Service Director) | `rajesh@apexautohub.com` | `rajesh123` |
| **Staff / Lead Mechanic** | Vikram Singh (Lead Mechanic) | `vikram@apexautohub.com` | `vikram123` |
| **Staff / Specialist** | Ananya Iyer (Diagnostic Specialist) | `ananya@apexautohub.com` | `ananya123` |
| **Customer** | Revanth Reddy | `revanth@vehicleservice.com` | `customer123` |

---

## System Architecture & Features

1. **Customer Portal**:
   - **Garage Management**: Add, view, and manage vehicles (Make, Model, Plate, Mileage, Fuel type).
   - **Smart Slot Booking Wizard**: 5-step interactive wizard with real-time capacity checking across multiple service centers in Hyderabad.
   - **Live Service & Milestone Tracker**: 6-stage real-time progress tracker (`Booked` $\to$ `Checked In` $\to$ `Inspection` $\to$ `Repair` $\to$ `Quality Check` $\to$ `Ready for Delivery` $\to$ `Completed`).
   - **Digital Invoices & History**: Itemized breakdown with 18% GST calculation, spare parts, labor, printable PDF view, and 1-click payment simulation.
   - **Milestone Notification Center**: Interactive notification popover showing SMS and email logs with timestamps.

2. **Staff / Mechanic Workbench**:
   - View assigned vehicle repair jobs and active bay vehicles.
   - 1-Click stage progression with mechanic inspection notes.
   - Log spare parts (e.g. ceramic brake pads, synthetic engine oil) and labor charges directly to the digital invoice.

3. **Administrator Control Console**:
   - Executive dashboard with real-time KPI metrics (Total bookings, Active bays, Revenue collected, Registered cars).
   - Multi-center slot utilization and load monitoring.
   - Mechanic Dispatcher: Assign and dispatch technicians to incoming bookings.
   - Full audit trail history log inspector.

---

## How to Run Locally

### 1. Database Initialization (MySQL)
Make sure MySQL 8.0 is running on your machine:
```bash
cd backend
npm run init-db
```
*This automatically executes `schema.sql` and `seed.sql` on `localhost:3306` with user `root` and password `root`.*

### 2. Start Backend API
```bash
cd backend
npm start
```
*Backend runs on `http://localhost:5000`. Health check: `http://localhost:5000/api/health`.*

### 3. Start Frontend UI
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`.*
