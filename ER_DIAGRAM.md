# Entity-Relationship (ER) Diagram
## Project: The Vehicle Service Booking and Tracking System
**Course**: DATABASE SYSTEMS ENGINEERING AND DISTRIBUTED BACKEND DEVELOPMENT (25CS1302E)  
**Team No**: 24 | **Section**: Sec No-2  
**Students**: Revanth Reddy (`2520030424`) & Subhash (`2520030391`)  
**Database**: `vehicle_service_db` (MySQL 8.0 Engine)

---

## 1. Mermaid Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ VEHICLES : "owns"
    USERS ||--o{ BOOKINGS : "places"
    USERS ||--o{ JOB_ASSIGNMENTS : "assigned as mechanic"
    USERS ||--o{ SERVICE_HISTORY_LOGS : "logs milestone"
    USERS ||--o{ INVOICES : "billed to"
    USERS ||--o{ NOTIFICATIONS : "receives"

    SERVICE_CENTERS ||--o{ SERVICE_SLOTS : "schedules"
    SERVICE_CENTERS ||--o{ BOOKINGS : "hosts"

    VEHICLES ||--o{ BOOKINGS : "services"

    SERVICE_SLOTS ||--o{ BOOKINGS : "reserves slot"

    BOOKINGS ||--o{ BOOKING_SERVICES : "contains"
    SERVICE_TYPES ||--o{ BOOKING_SERVICES : "mapped in"

    BOOKINGS ||--o{ JOB_ASSIGNMENTS : "dispatched to"
    BOOKINGS ||--o{ SERVICE_HISTORY_LOGS : "has audit trail"
    BOOKINGS ||--|| INVOICES : "generates bill"
    BOOKINGS ||--o{ NOTIFICATIONS : "triggers alert"

    INVOICES ||--o{ INVOICE_ITEMS : "has line items"

    USERS {
        int id PK
        string name
        string email UK
        string password_hash
        enum role "customer, staff, admin"
        string phone
        timestamp created_at
    }

    SERVICE_CENTERS {
        int id PK
        string name
        string code UK
        string address
        string city
        string phone
        string email
        int capacity_per_slot
        boolean is_active
        timestamp created_at
    }

    VEHICLES {
        int id PK
        int user_id FK
        string reg_no UK
        string make
        string model
        int year
        enum fuel_type "Petrol, Diesel, EV, Hybrid, CNG"
        int mileage
        string color
        timestamp created_at
    }

    SERVICE_TYPES {
        int id PK
        string name
        enum category "Maintenance, Repair, Diagnostics, Detailing"
        text description
        decimal estimated_hours
        decimal base_price
        boolean is_active
    }

    SERVICE_SLOTS {
        int id PK
        int service_center_id FK
        date slot_date
        string slot_time
        int max_capacity
        int booked_count
    }

    BOOKINGS {
        int id PK
        string booking_code UK
        int user_id FK
        int vehicle_id FK
        int service_center_id FK
        int slot_id FK
        date booking_date
        string slot_time
        enum status "booked, checked_in, inspection, repair, quality_check, ready_for_delivery, completed, cancelled"
        text notes
        datetime estimated_completion
        decimal total_amount
        timestamp created_at
    }

    BOOKING_SERVICES {
        int booking_id PK, FK
        int service_type_id PK, FK
        decimal price
    }

    JOB_ASSIGNMENTS {
        int id PK
        int booking_id FK
        int mechanic_user_id FK
        enum status "assigned, in_progress, completed"
        timestamp assigned_at
        timestamp completed_at
        text notes
    }

    SERVICE_HISTORY_LOGS {
        int id PK
        int booking_id FK
        string status_from
        string status_to
        int changed_by_user_id FK
        text comments
        timestamp created_at
    }

    INVOICES {
        int id PK
        string invoice_number UK
        int booking_id FK
        int user_id FK
        decimal subtotal
        decimal tax
        decimal discount
        decimal grand_total
        enum payment_status "unpaid, paid, refunded"
        string payment_method
        timestamp invoice_date
    }

    INVOICE_ITEMS {
        int id PK
        int invoice_id FK
        string description
        enum item_type "service, part, labor, other"
        int quantity
        decimal unit_price
        decimal total_price
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        int booking_id FK
        enum channel "email, sms, system"
        string title
        text message
        enum status "sent, delivered, simulated"
        timestamp sent_at
    }
```

---

## 2. Relational Cardinalities & Constraints Summary

| Relationship | Cardinality | Foreign Key Constraint | Description |
|---|---|---|---|
| **USERS $\to$ VEHICLES** | 1 : N (One-to-Many) | `ON DELETE CASCADE` | One user can register multiple vehicles; deleting a user removes their vehicles. |
| **USERS $\to$ BOOKINGS** | 1 : N (One-to-Many) | `ON DELETE CASCADE` | A customer places multiple service bookings over time. |
| **VEHICLES $\to$ BOOKINGS** | 1 : N (One-to-Many) | `ON DELETE CASCADE` | Each vehicle accumulates a complete chronological service history. |
| **SERVICE_CENTERS $\to$ SLOTS** | 1 : N (One-to-Many) | `ON DELETE CASCADE` | Each station manages distinct time slots per calendar date. |
| **SERVICE_CENTERS $\to$ BOOKINGS**| 1 : N (One-to-Many) | `ON DELETE RESTRICT` | Center cannot be deleted if active bookings exist. |
| **BOOKINGS $\leftrightarrow$ SERVICE_TYPES**| N : M (Many-to-Many) | Via `BOOKING_SERVICES` composite PK | A booking can bundle multiple maintenance/repair services. |
| **BOOKINGS $\to$ JOB_ASSIGNMENTS**| 1 : N (One-to-Many) | `ON DELETE CASCADE` | A job is dispatched to a certified mechanic (`role = 'staff'`). |
| **BOOKINGS $\to$ SERVICE_HISTORY_LOGS**| 1 : N (One-to-Many) | `ON DELETE CASCADE` | Immutable audit trail tracking every milestone from Check-in to Delivery. |
| **BOOKINGS $\to$ INVOICES** | 1 : 1 (One-to-One) | `UNIQUE (booking_id)` | Each completed service generates exactly one official digital tax invoice. |
| **INVOICES $\to$ INVOICE_ITEMS**| 1 : N (One-to-Many) | `ON DELETE CASCADE` | Line items detailing specific labor charges, consumables, and OEM spare parts. |
| **USERS $\to$ NOTIFICATIONS** | 1 : N (One-to-Many) | `ON DELETE CASCADE` | Historical log of SMS and email alerts dispatched to customer/staff. |

---

## 3. Database Normalization Level (3NF / BCNF)
- **1NF (First Normal Form)**: Every table has an atomic primary key (`id` or composite PK in `booking_services`). No repeating groups.
- **2NF (Second Normal Form)**: All non-key attributes are fully functionally dependent on the complete primary key.
- **3NF (Third Normal Form)**: No transitive dependencies exist. Line item amounts (`total_price`) and tax calculations are derived through dedicated relation tables rather than redundant columns on the master entity.
