USE `vehicle_service_db`;

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `notifications`;
TRUNCATE TABLE `invoice_items`;
TRUNCATE TABLE `invoices`;
TRUNCATE TABLE `service_history_logs`;
TRUNCATE TABLE `job_assignments`;
TRUNCATE TABLE `booking_services`;
TRUNCATE TABLE `bookings`;
TRUNCATE TABLE `service_slots`;
TRUNCATE TABLE `service_types`;
TRUNCATE TABLE `vehicles`;
TRUNCATE TABLE `service_centers`;
TRUNCATE TABLE `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Users (Admin, Staff / Mechanics, Customers)
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`) VALUES
(1, 'Central Administrator', 'admin@vehicleservice.com', '$2a$10$7XR7nxGwYjbYiwvUtN8d8uLMF0MZc8dyjxmILNI6Rr1CQd7pbhcIm', 'admin', '+91 98765 43210'),
(2, 'Suresh Kumar (Lead Mechanic)', 'suresh@vehicleservice.com', '$2a$10$RgcBPmrjJhp.sLbfTsPgiOfznpGF2JkRQaZhq/eu.xQmCaB9luhK.', 'staff', '+91 98765 43211'),
(3, 'Priya Sharma (Diagnostic Specialist)', 'priya@vehicleservice.com', '$2a$10$RgcBPmrjJhp.sLbfTsPgiOfznpGF2JkRQaZhq/eu.xQmCaB9luhK.', 'staff', '+91 98765 43212'),
(4, 'Revanth Reddy', 'revanth@vehicleservice.com', '$2a$10$Dri/IARpbO4k9zJHI0iqUuPLWPDbyL6SOWtLspV4vJlIyrfdPyQrm', 'customer', '+91 98765 43213'),
(5, 'Subhash', 'subhash@vehicleservice.com', '$2a$10$Dri/IARpbO4k9zJHI0iqUuPLWPDbyL6SOWtLspV4vJlIyrfdPyQrm', 'customer', '+91 98765 43214');

-- 2. Insert Service Centers
INSERT INTO `service_centers` (`id`, `name`, `code`, `address`, `city`, `phone`, `email`, `capacity_per_slot`, `is_active`) VALUES
(1, 'Apex Auto Hub - Hyderabad Central', 'HYD-01', 'Plot 42, Road No 36, Jubilee Hills', 'Hyderabad', '+91 40 2355 9001', 'central@vehicleservice.com', 6, TRUE),
(2, 'Apex Express Center - Hitech City', 'HTC-02', 'Cyber Gateway Lane, Madhapur', 'Hyderabad', '+91 40 2988 7720', 'hitech@vehicleservice.com', 4, TRUE),
(3, 'Apex Mega Workshop - Secunderabad', 'SEC-03', 'Clock Tower Main Road, Secunderabad', 'Secunderabad', '+91 40 2780 4455', 'secunderabad@vehicleservice.com', 8, TRUE);

-- 3. Insert Vehicles
INSERT INTO `vehicles` (`id`, `user_id`, `reg_no`, `make`, `model`, `year`, `fuel_type`, `mileage`, `color`) VALUES
(1, 4, 'TS 09 EA 4521', 'Hyundai', 'Creta SX(O)', 2022, 'Petrol', 24500, 'Phantom Black'),
(2, 4, 'TS 07 HK 1088', 'Honda', 'City ZX', 2021, 'Petrol', 38200, 'Platinum White Pearl'),
(3, 5, 'TS 08 FJ 9912', 'Tata', 'Nexon EV Empowered', 2023, 'Electric', 16400, 'Empowered Oxide'),
(4, 5, 'AP 29 BR 3341', 'Mahindra', 'Thar 4x4', 2022, 'Diesel', 29000, 'Red Rage');

-- 4. Insert Service Types / Catalog
INSERT INTO `service_types` (`id`, `name`, `category`, `description`, `estimated_hours`, `base_price`, `is_active`) VALUES
(1, 'Periodic Maintenance Service', 'Maintenance', 'Full 45-point inspection, engine oil replacement, oil filter, air filter cleaning, fluid top-ups, and underbody wash.', 3.50, 3500.00, TRUE),
(2, 'Synthetic Engine Oil & Filter Change', 'Maintenance', 'Premium 5W-30 / 0W-20 fully synthetic engine oil change with OEM grade oil filter replacement.', 1.00, 1850.00, TRUE),
(3, 'Braking System Overhaul', 'Repair', 'Front & rear brake pad check, caliper cleaning, rotor disc inspection, brake line fluid flush and bleed.', 2.00, 2400.00, TRUE),
(4, 'Computerized Engine Diagnostics', 'Diagnostics', 'OBD-II scanner fault code analysis, sensor calibration, live ECU parameter evaluation, electrical check.', 1.50, 1200.00, TRUE),
(5, 'Climate Control & AC Deep Servicing', 'Maintenance', 'AC gas recharge (R134a/R1234yf), condenser coil washing, cabin filter replacement, evaporator disinfectant treatment.', 2.50, 2250.00, TRUE),
(6, 'Laser Wheel Alignment & 3D Balancing', 'Maintenance', 'High precision 4-wheel computerized laser alignment, tire rotation, dynamic wheel counterweights balancing.', 1.00, 950.00, TRUE),
(7, 'Suspension & Steering Overhaul', 'Inspection', 'Strut check, bushing wear analysis, tie-rod end test, steering rack play diagnostic, road bounce test.', 1.50, 1100.00, TRUE),
(8, 'Ceramic Protection & Detailing', 'Detailing', 'Multi-stage paint correction, 9H ceramic coating layer application, interior leather/fabric steam shampooing.', 4.50, 5800.00, TRUE);

-- 5. Insert Slots (Current date and upcoming days)
INSERT INTO `service_slots` (`id`, `service_center_id`, `slot_date`, `slot_time`, `max_capacity`, `booked_count`) VALUES
(1, 1, CURDATE(), '09:00 AM - 11:00 AM', 6, 2),
(2, 1, CURDATE(), '11:30 AM - 01:30 PM', 6, 1),
(3, 1, CURDATE(), '02:30 PM - 04:30 PM', 6, 0),
(4, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00 AM - 11:00 AM', 6, 1),
(5, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:30 AM - 01:30 PM', 6, 0),
(6, 2, CURDATE(), '10:00 AM - 12:00 PM', 4, 1),
(7, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '02:00 PM - 04:00 PM', 4, 0),
(8, 3, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '09:00 AM - 11:00 AM', 8, 1);

-- 6. Insert Sample Bookings
INSERT INTO `bookings` (`id`, `booking_code`, `user_id`, `vehicle_id`, `service_center_id`, `slot_id`, `booking_date`, `slot_time`, `status`, `notes`, `estimated_completion`, `total_amount`) VALUES
(1, 'VSB-2026-1001', 4, 1, 1, 1, CURDATE(), '09:00 AM - 11:00 AM', 'repair', 'Slight brake vibration at 60 km/h and regular 25K service.', DATE_ADD(NOW(), INTERVAL 3 HOUR), 5900.00),
(2, 'VSB-2026-1002', 4, 2, 2, 6, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '10:00 AM - 12:00 PM', 'completed', 'AC cooling was slow. Full service and coolant flush performed.', DATE_SUB(NOW(), INTERVAL 2 DAY), 4100.00),
(3, 'VSB-2026-1003', 5, 3, 1, 2, CURDATE(), '11:30 AM - 01:30 PM', 'inspection', 'Electric powertrain routine 15k check & wheel alignment.', DATE_ADD(NOW(), INTERVAL 5 HOUR), 2150.00),
(4, 'VSB-2026-1004', 5, 4, 3, 8, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '09:00 AM - 11:00 AM', 'booked', 'Off-road pre-trip full suspension and brake checkup.', NULL, 3500.00);

-- 7. Insert Booking Services
INSERT INTO `booking_services` (`booking_id`, `service_type_id`, `price`) VALUES
(1, 1, 3500.00),
(1, 3, 2400.00),
(2, 2, 1850.00),
(2, 5, 2250.00),
(3, 4, 1200.00),
(3, 6, 950.00),
(4, 1, 3500.00);

-- 8. Insert Job Assignments (Staff assignments)
INSERT INTO `job_assignments` (`id`, `booking_id`, `mechanic_user_id`, `status`, `assigned_at`, `completed_at`, `notes`) VALUES
(1, 1, 2, 'in_progress', DATE_SUB(NOW(), INTERVAL 2 HOUR), NULL, 'Inspected brake discs; replacing front ceramic pads and ongoing general fluid service.'),
(2, 2, 3, 'completed', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 46 HOUR), 'AC refrigerant topped up to 450g; cabin filter replaced; test drive verified 4°C vent temp.'),
(3, 3, 2, 'assigned', DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL, 'EV battery health report generated (98.4% SOH); moving to alignment bay.');

-- 9. Insert Service History Logs (Real-time tracking audit trail)
INSERT INTO `service_history_logs` (`id`, `booking_id`, `status_from`, `status_to`, `changed_by_user_id`, `comments`, `created_at`) VALUES
-- Booking 1 Journey
(1, 1, NULL, 'booked', 4, 'Online booking confirmed via Customer Portal.', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(2, 1, 'booked', 'checked_in', 1, 'Vehicle arrived at Jubilee Hills Bay 2. Odometer reading 24,510 km logged.', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(3, 1, 'checked_in', 'inspection', 2, 'Initial visual inspection completed. Found minor wear on front brake pads.', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(4, 1, 'inspection', 'repair', 2, 'Front brake pad replacement underway. Engine oil drain in progress.', DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- Booking 2 Journey (Completed)
(5, 2, NULL, 'booked', 4, 'Service slot booked online.', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(6, 2, 'booked', 'checked_in', 1, 'Vehicle checked in at Hitech City center.', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(7, 2, 'checked_in', 'inspection', 3, 'Diagnostic check indicated AC refrigerant drop and clogged cabin pollen filter.', DATE_SUB(NOW(), INTERVAL 50 HOUR)),
(8, 2, 'inspection', 'repair', 3, 'Flushed refrigerant, leak tested at 250 psi, replaced pollen filter.', DATE_SUB(NOW(), INTERVAL 48 HOUR)),
(9, 2, 'repair', 'quality_check', 3, 'Quality inspector passed road cooling test and cabin air purity test.', DATE_SUB(NOW(), INTERVAL 47 HOUR)),
(10, 2, 'ready_for_delivery', 'completed', 1, 'Payment settled and vehicle handed over to customer.', DATE_SUB(NOW(), INTERVAL 46 HOUR)),

-- Booking 3 Journey
(11, 3, NULL, 'booked', 5, 'Online appointment scheduled.', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(12, 3, 'booked', 'checked_in', 1, 'Nexon EV received at Express Station.', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(13, 3, 'checked_in', 'inspection', 2, 'High-voltage battery diagnostic scanner connected.', DATE_SUB(NOW(), INTERVAL 20 MINUTE)),

-- Booking 4 Journey
(14, 4, NULL, 'booked', 5, 'Booking confirmed for upcoming expedition preparation.', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 10. Insert Invoices
INSERT INTO `invoices` (`id`, `invoice_number`, `booking_id`, `user_id`, `subtotal`, `tax`, `discount`, `grand_total`, `payment_status`, `payment_method`, `invoice_date`) VALUES
(1, 'INV-2026-0891', 2, 4, 4100.00, 738.00, 200.00, 4638.00, 'paid', 'UPI / Card', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'INV-2026-0892', 1, 4, 5900.00, 1062.00, 300.00, 6662.00, 'unpaid', 'Pending Checkout', NOW());

-- 11. Insert Invoice Items
INSERT INTO `invoice_items` (`id`, `invoice_id`, `description`, `item_type`, `quantity`, `unit_price`, `total_price`) VALUES
-- Items for Invoice 1 (Completed job)
(1, 1, 'Synthetic Engine Oil & Filter Change', 'service', 1, 1850.00, 1850.00),
(2, 1, 'Climate Control & AC Deep Servicing', 'service', 1, 2250.00, 2250.00),
(3, 1, 'OEM Activated Charcoal AC Cabin Filter', 'part', 1, 650.00, 650.00),
-- Items for Invoice 2 (In-progress job)
(4, 2, 'Periodic Maintenance Service (25K)', 'service', 1, 3500.00, 3500.00),
(5, 2, 'Braking System Overhaul', 'service', 1, 2400.00, 2400.00),
(6, 2, 'Front Ceramic Brake Pads (Set of 4)', 'part', 1, 1800.00, 1800.00);

-- 12. Insert Notifications
INSERT INTO `notifications` (`id`, `user_id`, `booking_id`, `channel`, `title`, `message`, `status`, `sent_at`) VALUES
(1, 4, 1, 'sms', 'Booking Confirmed - VSB-2026-1001', 'Dear Revanth Reddy, your slot for Hyundai Creta (TS 09 EA 4521) is confirmed for today 09:00 AM at Jubilee Hills.', 'delivered', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(2, 4, 1, 'email', 'Vehicle Checked-In - Bay 2', 'Your Creta is checked in. Inspection has commenced under Lead Mechanic Suresh Kumar.', 'sent', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(3, 4, 1, 'sms', 'Repair Stage Started', 'Vehicle has entered the Repair bay. Estimated completion time is today by 03:00 PM.', 'delivered', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(4, 4, 2, 'email', 'Service Completed & Invoice Ready', 'Service on your Honda City is complete! Digital Invoice INV-2026-0891 is ready for viewing.', 'sent', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(5, 5, 3, 'sms', 'Check-In Confirmed - Tata Nexon EV', 'Subhash, your Nexon EV has reached the inspection bay at Hyderabad Central Hub.', 'delivered', DATE_SUB(NOW(), INTERVAL 1 HOUR));
