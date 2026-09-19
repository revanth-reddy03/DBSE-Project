-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: vehicle_service_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `booking_services`
--

DROP TABLE IF EXISTS `booking_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_services` (
  `booking_id` int NOT NULL,
  `service_type_id` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`booking_id`,`service_type_id`),
  KEY `service_type_id` (`service_type_id`),
  CONSTRAINT `booking_services_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `booking_services_ibfk_2` FOREIGN KEY (`service_type_id`) REFERENCES `service_types` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_services`
--

LOCK TABLES `booking_services` WRITE;
/*!40000 ALTER TABLE `booking_services` DISABLE KEYS */;
INSERT INTO `booking_services` VALUES (1,1,3500.00),(1,3,2400.00),(2,2,1850.00),(2,5,2250.00),(3,4,1200.00),(3,6,950.00),(4,1,3500.00),(5,1,3500.00),(5,4,1200.00);
/*!40000 ALTER TABLE `booking_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `vehicle_id` int NOT NULL,
  `service_center_id` int NOT NULL,
  `slot_id` int DEFAULT NULL,
  `booking_date` date NOT NULL,
  `slot_time` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('booked','checked_in','inspection','repair','quality_check','ready_for_delivery','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'booked',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `estimated_completion` datetime DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_code` (`booking_code`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `slot_id` (`slot_id`),
  KEY `idx_bookings_user` (`user_id`),
  KEY `idx_bookings_status` (`status`),
  KEY `idx_bookings_center` (`service_center_id`),
  KEY `idx_bookings_date` (`booking_date`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`service_center_id`) REFERENCES `service_centers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`slot_id`) REFERENCES `service_slots` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,'VSB-2026-1001',4,1,1,1,'2026-09-18','09:00 AM - 11:00 AM','repair','Slight brake vibration at 60 km/h and regular 25K service.','2026-09-18 15:05:26',5900.00,'2026-09-18 06:35:26','2026-09-18 06:35:26'),(2,'VSB-2026-1002',4,2,2,6,'2026-09-16','10:00 AM - 12:00 PM','completed','AC cooling was slow. Full service and coolant flush performed.','2026-09-16 12:05:26',4100.00,'2026-09-18 06:35:26','2026-09-18 06:35:26'),(3,'VSB-2026-1003',5,3,1,2,'2026-09-18','11:30 AM - 01:30 PM','inspection','Electric powertrain routine 15k check & wheel alignment.','2026-09-18 17:05:26',2150.00,'2026-09-18 06:35:26','2026-09-18 06:35:26'),(4,'VSB-2026-1004',5,4,3,8,'2026-09-20','09:00 AM - 11:00 AM','booked','Off-road pre-trip full suspension and brake checkup.',NULL,3500.00,'2026-09-18 06:35:26','2026-09-18 06:35:26'),(5,'VSB-20260918-9118',4,1,1,1,'2026-09-18','09:00 AM - 11:00 AM','inspection','Automated test booking run','2026-09-18 15:12:36',1450.00,'2026-09-18 06:42:36','2026-09-18 06:42:36');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_items`
--

DROP TABLE IF EXISTS `invoice_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_id` int NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_type` enum('service','part','labor','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'service',
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `invoice_id` (`invoice_id`),
  CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_items`
--

LOCK TABLES `invoice_items` WRITE;
/*!40000 ALTER TABLE `invoice_items` DISABLE KEYS */;
INSERT INTO `invoice_items` VALUES (1,1,'Synthetic Engine Oil & Filter Change','service',1,1850.00,1850.00),(2,1,'Climate Control & AC Deep Servicing','service',1,2250.00,2250.00),(3,1,'OEM Activated Charcoal AC Cabin Filter','part',1,650.00,650.00),(4,2,'Periodic Maintenance Service (25K)','service',1,3500.00,3500.00),(5,2,'Braking System Overhaul','service',1,2400.00,2400.00),(6,2,'Front Ceramic Brake Pads (Set of 4)','part',1,1800.00,1800.00),(7,3,'Bosch Performance Air Filter OEM','part',1,1450.00,1450.00);
/*!40000 ALTER TABLE `invoice_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_id` int NOT NULL,
  `user_id` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tax` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `grand_total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `payment_status` enum('unpaid','paid','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unpaid',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Cash/Card',
  `invoice_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  UNIQUE KEY `booking_id` (`booking_id`),
  KEY `idx_invoices_user` (`user_id`),
  KEY `idx_invoices_status` (`payment_status`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,'INV-2026-0891',2,4,4100.00,738.00,200.00,4638.00,'paid','UPI / Card','2026-09-16 06:35:26'),(2,'INV-2026-0892',1,4,5900.00,1062.00,300.00,6662.00,'unpaid','Pending Checkout','2026-09-18 06:35:26'),(3,'INV-2026-0005',5,4,1450.00,261.00,0.00,1450.00,'unpaid','Cash/Card','2026-09-18 06:42:36');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_assignments`
--

DROP TABLE IF EXISTS `job_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `mechanic_user_id` int NOT NULL,
  `status` enum('assigned','in_progress','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'assigned',
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_job_mechanic` (`mechanic_user_id`),
  KEY `idx_job_booking` (`booking_id`),
  CONSTRAINT `job_assignments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `job_assignments_ibfk_2` FOREIGN KEY (`mechanic_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_assignments`
--

LOCK TABLES `job_assignments` WRITE;
/*!40000 ALTER TABLE `job_assignments` DISABLE KEYS */;
INSERT INTO `job_assignments` VALUES (1,1,2,'in_progress','2026-09-18 04:35:26',NULL,'Inspected brake discs; replacing front ceramic pads and ongoing general fluid service.'),(2,2,3,'completed','2026-09-16 06:35:26','2026-09-16 08:35:26','AC refrigerant topped up to 450g; cabin filter replaced; test drive verified 4°C vent temp.'),(3,3,2,'assigned','2026-09-18 06:05:26',NULL,'EV battery health report generated (98.4% SOH); moving to alignment bay.');
/*!40000 ALTER TABLE `job_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `booking_id` int DEFAULT NULL,
  `channel` enum('email','sms','system') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'email',
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('sent','delivered','simulated','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'sent',
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `idx_notif_user` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,4,1,'sms','Booking Confirmed - VSB-2026-1001','Dear Revanth Reddy, your slot for Hyundai Creta (TS 09 EA 4521) is confirmed for today 09:00 AM at Jubilee Hills.','delivered','2026-09-18 02:35:26'),(2,4,1,'email','Vehicle Checked-In - Bay 2','Your Creta is checked in. Inspection has commenced under Lead Mechanic Suresh Kumar.','sent','2026-09-18 03:35:26'),(3,4,1,'sms','Repair Stage Started','Vehicle has entered the Repair bay. Estimated completion time is today by 03:00 PM.','delivered','2026-09-18 05:35:26'),(4,4,2,'email','Service Completed & Invoice Ready','Service on your Honda City is complete! Digital Invoice INV-2026-0891 is ready for viewing.','sent','2026-09-16 06:35:26'),(5,5,3,'sms','Check-In Confirmed - Tata Nexon EV','Subhash, your Nexon EV has reached the inspection bay at Hyderabad Central Hub.','delivered','2026-09-18 05:35:26'),(6,4,5,'sms','Booking Confirmed #VSB-20260918-9118','Your appointment for Hyundai Creta SX(O) (TS 09 EA 4521) at Apex Auto Hub - Hyderabad Central on 2026-09-18 (09:00 AM - 11:00 AM) has been confirmed.','delivered','2026-09-18 06:42:36'),(7,4,5,'email','Service Booking Receipt #VSB-20260918-9118','Thank you for scheduling with Apex Auto Hub. Your booking code is VSB-20260918-9118. Services: Periodic Maintenance Service, Computerized Engine Diagnostics. Total Estimated: ₹4700.00.','delivered','2026-09-18 06:42:36'),(8,4,5,'sms','Service Update: INSPECTION','Diagnostic inspection is now underway for your Hyundai Creta SX(O). Note: OBD-II diagnostics connected, battery health check normal.','delivered','2026-09-18 06:42:36'),(9,4,5,'email','Status Alert: Hyundai Creta SX(O) is now INSPECTION','Diagnostic inspection is now underway for your Hyundai Creta SX(O). Note: OBD-II diagnostics connected, battery health check normal.','delivered','2026-09-18 06:42:36');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_centers`
--

DROP TABLE IF EXISTS `service_centers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_centers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `capacity_per_slot` int NOT NULL DEFAULT '5',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_centers_city` (`city`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_centers`
--

LOCK TABLES `service_centers` WRITE;
/*!40000 ALTER TABLE `service_centers` DISABLE KEYS */;
INSERT INTO `service_centers` VALUES (1,'Apex Auto Hub - Hyderabad Central','HYD-01','Plot 42, Road No 36, Jubilee Hills','Hyderabad','+91 40 2355 9001','central@vehicleservice.com',6,1,'2026-09-18 06:35:26'),(2,'Apex Express Center - Hitech City','HTC-02','Cyber Gateway Lane, Madhapur','Hyderabad','+91 40 2988 7720','hitech@vehicleservice.com',4,1,'2026-09-18 06:35:26'),(3,'Apex Mega Workshop - Secunderabad','SEC-03','Clock Tower Main Road, Secunderabad','Secunderabad','+91 40 2780 4455','secunderabad@vehicleservice.com',8,1,'2026-09-18 06:35:26');
/*!40000 ALTER TABLE `service_centers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_history_logs`
--

DROP TABLE IF EXISTS `service_history_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_history_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `status_from` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status_to` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_by_user_id` int DEFAULT NULL,
  `comments` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `changed_by_user_id` (`changed_by_user_id`),
  KEY `idx_history_booking` (`booking_id`),
  CONSTRAINT `service_history_logs_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `service_history_logs_ibfk_2` FOREIGN KEY (`changed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_history_logs`
--

LOCK TABLES `service_history_logs` WRITE;
/*!40000 ALTER TABLE `service_history_logs` DISABLE KEYS */;
INSERT INTO `service_history_logs` VALUES (1,1,NULL,'booked',4,'Online booking confirmed via Customer Portal.','2026-09-18 02:35:26'),(2,1,'booked','checked_in',1,'Vehicle arrived at Jubilee Hills Bay 2. Odometer reading 24,510 km logged.','2026-09-18 03:35:26'),(3,1,'checked_in','inspection',2,'Initial visual inspection completed. Found minor wear on front brake pads.','2026-09-18 04:35:26'),(4,1,'inspection','repair',2,'Front brake pad replacement underway. Engine oil drain in progress.','2026-09-18 05:35:26'),(5,2,NULL,'booked',4,'Service slot booked online.','2026-09-15 06:35:26'),(6,2,'booked','checked_in',1,'Vehicle checked in at Hitech City center.','2026-09-16 06:35:26'),(7,2,'checked_in','inspection',3,'Diagnostic check indicated AC refrigerant drop and clogged cabin pollen filter.','2026-09-16 04:35:26'),(8,2,'inspection','repair',3,'Flushed refrigerant, leak tested at 250 psi, replaced pollen filter.','2026-09-16 06:35:26'),(9,2,'repair','quality_check',3,'Quality inspector passed road cooling test and cabin air purity test.','2026-09-16 07:35:26'),(10,2,'ready_for_delivery','completed',1,'Payment settled and vehicle handed over to customer.','2026-09-16 08:35:26'),(11,3,NULL,'booked',5,'Online appointment scheduled.','2026-09-18 01:35:26'),(12,3,'booked','checked_in',1,'Nexon EV received at Express Station.','2026-09-18 05:35:26'),(13,3,'checked_in','inspection',2,'High-voltage battery diagnostic scanner connected.','2026-09-18 06:15:26'),(14,4,NULL,'booked',5,'Booking confirmed for upcoming expedition preparation.','2026-09-17 06:35:26'),(15,5,NULL,'booked',4,'Online booking confirmed via Customer Portal.','2026-09-18 06:42:36'),(16,5,'booked','inspection',2,'OBD-II diagnostics connected, battery health check normal.','2026-09-18 06:42:36'),(17,5,'parts_logged','parts_logged',2,'Added part: Bosch Performance Air Filter OEM (1x @ ₹1450) = ₹1450','2026-09-18 06:42:36');
/*!40000 ALTER TABLE `service_history_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_slots`
--

DROP TABLE IF EXISTS `service_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_slots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `service_center_id` int NOT NULL,
  `slot_date` date NOT NULL,
  `slot_time` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `max_capacity` int NOT NULL DEFAULT '5',
  `booked_count` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_center_date_time` (`service_center_id`,`slot_date`,`slot_time`),
  KEY `idx_slots_center_date` (`service_center_id`,`slot_date`),
  CONSTRAINT `service_slots_ibfk_1` FOREIGN KEY (`service_center_id`) REFERENCES `service_centers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_slots`
--

LOCK TABLES `service_slots` WRITE;
/*!40000 ALTER TABLE `service_slots` DISABLE KEYS */;
INSERT INTO `service_slots` VALUES (1,1,'2026-09-18','09:00 AM - 11:00 AM',6,3),(2,1,'2026-09-18','11:30 AM - 01:30 PM',6,1),(3,1,'2026-09-18','02:30 PM - 04:30 PM',6,0),(4,1,'2026-09-19','09:00 AM - 11:00 AM',6,1),(5,1,'2026-09-19','11:30 AM - 01:30 PM',6,0),(6,2,'2026-09-18','10:00 AM - 12:00 PM',4,1),(7,2,'2026-09-19','02:00 PM - 04:00 PM',4,0),(8,3,'2026-09-20','09:00 AM - 11:00 AM',8,1);
/*!40000 ALTER TABLE `service_slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_types`
--

DROP TABLE IF EXISTS `service_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('Maintenance','Repair','Inspection','Detailing','Diagnostics') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Maintenance',
  `description` text COLLATE utf8mb4_unicode_ci,
  `estimated_hours` decimal(4,2) NOT NULL DEFAULT '2.00',
  `base_price` decimal(10,2) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_service_cat` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_types`
--

LOCK TABLES `service_types` WRITE;
/*!40000 ALTER TABLE `service_types` DISABLE KEYS */;
INSERT INTO `service_types` VALUES (1,'Periodic Maintenance Service','Maintenance','Full 45-point inspection, engine oil replacement, oil filter, air filter cleaning, fluid top-ups, and underbody wash.',3.50,3500.00,1),(2,'Synthetic Engine Oil & Filter Change','Maintenance','Premium 5W-30 / 0W-20 fully synthetic engine oil change with OEM grade oil filter replacement.',1.00,1850.00,1),(3,'Braking System Overhaul','Repair','Front & rear brake pad check, caliper cleaning, rotor disc inspection, brake line fluid flush and bleed.',2.00,2400.00,1),(4,'Computerized Engine Diagnostics','Diagnostics','OBD-II scanner fault code analysis, sensor calibration, live ECU parameter evaluation, electrical check.',1.50,1200.00,1),(5,'Climate Control & AC Deep Servicing','Maintenance','AC gas recharge (R134a/R1234yf), condenser coil washing, cabin filter replacement, evaporator disinfectant treatment.',2.50,2250.00,1),(6,'Laser Wheel Alignment & 3D Balancing','Maintenance','High precision 4-wheel computerized laser alignment, tire rotation, dynamic wheel counterweights balancing.',1.00,950.00,1),(7,'Suspension & Steering Overhaul','Inspection','Strut check, bushing wear analysis, tie-rod end test, steering rack play diagnostic, road bounce test.',1.50,1100.00,1),(8,'Ceramic Protection & Detailing','Detailing','Multi-stage paint correction, 9H ceramic coating layer application, interior leather/fabric steam shampooing.',4.50,5800.00,1);
/*!40000 ALTER TABLE `service_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('customer','staff','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Central Administrator','admin@vehicleservice.com','$2a$10$7XR7nxGwYjbYiwvUtN8d8uLMF0MZc8dyjxmILNI6Rr1CQd7pbhcIm','admin','+91 98765 43210','2026-09-18 06:35:25','2026-09-18 06:35:25'),(2,'Suresh Kumar (Lead Mechanic)','suresh@vehicleservice.com','$2a$10$RgcBPmrjJhp.sLbfTsPgiOfznpGF2JkRQaZhq/eu.xQmCaB9luhK.','staff','+91 98765 43211','2026-09-18 06:35:25','2026-09-18 06:35:25'),(3,'Priya Sharma (Diagnostic Specialist)','priya@vehicleservice.com','$2a$10$RgcBPmrjJhp.sLbfTsPgiOfznpGF2JkRQaZhq/eu.xQmCaB9luhK.','staff','+91 98765 43212','2026-09-18 06:35:25','2026-09-18 06:35:25'),(4,'Revanth Reddy','revanth@vehicleservice.com','$2a$10$Dri/IARpbO4k9zJHI0iqUuPLWPDbyL6SOWtLspV4vJlIyrfdPyQrm','customer','+91 98765 43213','2026-09-18 06:35:25','2026-09-18 06:35:25'),(5,'Subhash','subhash@vehicleservice.com','$2a$10$Dri/IARpbO4k9zJHI0iqUuPLWPDbyL6SOWtLspV4vJlIyrfdPyQrm','customer','+91 98765 43214','2026-09-18 06:35:25','2026-09-18 06:35:25');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `reg_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `make` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `year` int NOT NULL,
  `fuel_type` enum('Petrol','Diesel','Electric','Hybrid','CNG') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Petrol',
  `mileage` int DEFAULT '0',
  `color` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reg_no` (`reg_no`),
  KEY `idx_vehicles_user` (`user_id`),
  KEY `idx_vehicles_reg` (`reg_no`),
  CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
INSERT INTO `vehicles` VALUES (1,4,'TS 09 EA 4521','Hyundai','Creta SX(O)',2022,'Petrol',24500,'Phantom Black','2026-09-18 06:35:26'),(2,4,'TS 07 HK 1088','Honda','City ZX',2021,'Petrol',38200,'Platinum White Pearl','2026-09-18 06:35:26'),(3,5,'TS 08 FJ 9912','Tata','Nexon EV Empowered',2023,'Electric',16400,'Empowered Oxide','2026-09-18 06:35:26'),(4,5,'AP 29 BR 3341','Mahindra','Thar 4x4',2022,'Diesel',29000,'Red Rage','2026-09-18 06:35:26');
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-18 13:33:09
