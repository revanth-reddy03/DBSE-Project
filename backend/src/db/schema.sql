-- ===============================================================
-- Database: vehicle_service_db
-- Project: The Vehicle Service Booking and Tracking System
-- Course: DATABASE SYSTEMS ENGINEERING AND DISTRIBUTED BACKEND DEVELOPMENT (25CS1302E)
-- Authors: Revanth Reddy (2520030424), Subhash (2520030391)
-- ===============================================================

CREATE DATABASE IF NOT EXISTS `vehicle_service_db`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `vehicle_service_db`;

-- Drop tables in reverse order of foreign key dependency
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `invoice_items`;
DROP TABLE IF EXISTS `invoices`;
DROP TABLE IF EXISTS `service_history_logs`;
DROP TABLE IF EXISTS `job_assignments`;
DROP TABLE IF EXISTS `booking_services`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `service_slots`;
DROP TABLE IF EXISTS `service_types`;
DROP TABLE IF EXISTS `vehicles`;
DROP TABLE IF EXISTS `service_centers`;
DROP TABLE IF EXISTS `users`;

-- 1. Users Table (Role-based access: customer, staff, admin)
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(120) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('customer', 'staff', 'admin') NOT NULL DEFAULT 'customer',
    `phone` VARCHAR(20),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB;

-- 2. Service Centers Table (Multi-center support)
CREATE TABLE `service_centers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `code` VARCHAR(20) NOT NULL UNIQUE,
    `address` VARCHAR(255) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(120),
    `capacity_per_slot` INT NOT NULL DEFAULT 5,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_centers_city` (`city`)
) ENGINE=InnoDB;

-- 3. Vehicles Table (Customer Vehicle Profiles)
CREATE TABLE `vehicles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `reg_no` VARCHAR(50) NOT NULL UNIQUE,
    `make` VARCHAR(50) NOT NULL,
    `model` VARCHAR(50) NOT NULL,
    `year` INT NOT NULL,
    `fuel_type` ENUM('Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG') NOT NULL DEFAULT 'Petrol',
    `mileage` INT DEFAULT 0,
    `color` VARCHAR(40),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_vehicles_user` (`user_id`),
    INDEX `idx_vehicles_reg` (`reg_no`)
) ENGINE=InnoDB;

-- 4. Service Types / Catalog
CREATE TABLE `service_types` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `category` ENUM('Maintenance', 'Repair', 'Inspection', 'Detailing', 'Diagnostics') NOT NULL DEFAULT 'Maintenance',
    `description` TEXT,
    `estimated_hours` DECIMAL(4,2) NOT NULL DEFAULT 2.00,
    `base_price` DECIMAL(10,2) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX `idx_service_cat` (`category`)
) ENGINE=InnoDB;

-- 5. Service Slots Table (Automated slot scheduling & capacity management)
CREATE TABLE `service_slots` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `service_center_id` INT NOT NULL,
    `slot_date` DATE NOT NULL,
    `slot_time` VARCHAR(30) NOT NULL,
    `max_capacity` INT NOT NULL DEFAULT 5,
    `booked_count` INT NOT NULL DEFAULT 0,
    UNIQUE KEY `uk_center_date_time` (`service_center_id`, `slot_date`, `slot_time`),
    FOREIGN KEY (`service_center_id`) REFERENCES `service_centers`(`id`) ON DELETE CASCADE,
    INDEX `idx_slots_center_date` (`service_center_id`, `slot_date`)
) ENGINE=InnoDB;

-- 6. Bookings Table
CREATE TABLE `bookings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `booking_code` VARCHAR(30) NOT NULL UNIQUE,
    `user_id` INT NOT NULL,
    `vehicle_id` INT NOT NULL,
    `service_center_id` INT NOT NULL,
    `slot_id` INT NULL,
    `booking_date` DATE NOT NULL,
    `slot_time` VARCHAR(50) NOT NULL,
    `status` ENUM(
        'booked',
        'checked_in',
        'inspection',
        'repair',
        'quality_check',
        'ready_for_delivery',
        'completed',
        'cancelled'
    ) NOT NULL DEFAULT 'booked',
    `notes` TEXT,
    `estimated_completion` DATETIME NULL,
    `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`service_center_id`) REFERENCES `service_centers`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`slot_id`) REFERENCES `service_slots`(`id`) ON DELETE SET NULL,
    INDEX `idx_bookings_user` (`user_id`),
    INDEX `idx_bookings_status` (`status`),
    INDEX `idx_bookings_center` (`service_center_id`),
    INDEX `idx_bookings_date` (`booking_date`)
) ENGINE=InnoDB;

-- 7. Booking Services (Many-to-Many join between Bookings and Service Types)
CREATE TABLE `booking_services` (
    `booking_id` INT NOT NULL,
    `service_type_id` INT NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (`booking_id`, `service_type_id`),
    FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`service_type_id`) REFERENCES `service_types`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 8. Job Assignments (Mechanic assignment and workflow tracking)
CREATE TABLE `job_assignments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `booking_id` INT NOT NULL,
    `mechanic_user_id` INT NOT NULL,
    `status` ENUM('assigned', 'in_progress', 'completed') NOT NULL DEFAULT 'assigned',
    `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `completed_at` TIMESTAMP NULL,
    `notes` TEXT,
    FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`mechanic_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_job_mechanic` (`mechanic_user_id`),
    INDEX `idx_job_booking` (`booking_id`)
) ENGINE=InnoDB;

-- 9. Service History Logs (Audit trail of every milestone transition)
CREATE TABLE `service_history_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `booking_id` INT NOT NULL,
    `status_from` VARCHAR(50),
    `status_to` VARCHAR(50) NOT NULL,
    `changed_by_user_id` INT NULL,
    `comments` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`changed_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_history_booking` (`booking_id`)
) ENGINE=InnoDB;

-- 10. Invoices Table (Auto-generated billing)
CREATE TABLE `invoices` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `invoice_number` VARCHAR(50) NOT NULL UNIQUE,
    `booking_id` INT NOT NULL UNIQUE,
    `user_id` INT NOT NULL,
    `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `tax` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `discount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `grand_total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `payment_status` ENUM('unpaid', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid',
    `payment_method` VARCHAR(50) DEFAULT 'Cash/Card',
    `invoice_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_invoices_user` (`user_id`),
    INDEX `idx_invoices_status` (`payment_status`)
) ENGINE=InnoDB;

-- 11. Invoice Line Items (Services, replaced spare parts, and labor)
CREATE TABLE `invoice_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `invoice_id` INT NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `item_type` ENUM('service', 'part', 'labor', 'other') NOT NULL DEFAULT 'service',
    `quantity` INT NOT NULL DEFAULT 1,
    `unit_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `total_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Notifications Table (SMS and Email milestone alerts)
CREATE TABLE `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `booking_id` INT NULL,
    `channel` ENUM('email', 'sms', 'system') NOT NULL DEFAULT 'email',
    `title` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('sent', 'delivered', 'simulated', 'failed') NOT NULL DEFAULT 'sent',
    `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE SET NULL,
    INDEX `idx_notif_user` (`user_id`)
) ENGINE=InnoDB;
