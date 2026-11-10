
-- =====================================================
-- CAMPUSRIDE DATABASE MANAGEMENT SYSTEM
-- COMPLETE MYSQL DEMONSTRATION SCRIPT
-- =====================================================

-- SECTION 1: SELECT DATABASE
USE campus_mobility;

SELECT DATABASE() AS Current_Database;


-- =====================================================
-- SECTION 2: DISPLAY ALL TABLES
-- =====================================================

SHOW FULL TABLES;


-- =====================================================
-- SECTION 3: DISPLAY TABLE STRUCTURES
-- =====================================================

DESCRIBE users;
DESCRIBE vehicles;
DESCRIBE rides;
DESCRIBE bookings;


-- =====================================================
-- SECTION 4: DISPLAY TABLE DATA
-- =====================================================

SELECT * FROM users;
SELECT * FROM vehicles;
SELECT * FROM rides;
SELECT * FROM bookings;


-- =====================================================
-- SECTION 5: VERIFY INDEXES
-- =====================================================

SHOW INDEX FROM users;
SHOW INDEX FROM vehicles;
SHOW INDEX FROM rides;
SHOW INDEX FROM bookings;


-- Display all indexes together

SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;


-- =====================================================
-- SECTION 6: DISPLAY SQL VIEWS
-- =====================================================

SHOW FULL TABLES
WHERE TABLE_TYPE = 'VIEW';

-- Existing ride details view
SELECT * FROM ride_details_view;

-- Inspect the definition of the ride view
SHOW CREATE VIEW ride_details_view;

-- Use SHOW FULL TABLES above to identify the name
-- of your second view, then run SELECT * FROM its_name;


-- =====================================================
-- SECTION 7: VERIFY SQL TRIGGERS
-- =====================================================

SHOW TRIGGERS;

-- Inspect trigger definitions
SHOW CREATE TRIGGER trg_booking_after_insert;

SHOW CREATE TRIGGER trg_booking_after_update;


-- =====================================================
-- SECTION 8: DEMONSTRATE TRIGGER RESULTS
-- =====================================================

-- Check available seats before/after application booking
SELECT
    ride_id,
    total_seats,
    available_seats,
    status
FROM rides
ORDER BY ride_id;

-- Check booking records
SELECT
    booking_id,
    ride_id,
    passenger_id,
    seats_requested,
    booking_status
FROM bookings
ORDER BY booking_id DESC;

-- Demonstrate booking and cancellation through
-- the CampusRide application.
-- The INSERT and UPDATE triggers update ride seats.


-- =====================================================
-- SECTION 9: STORED PROCEDURE
-- =====================================================

SHOW PROCEDURE STATUS
WHERE Db = DATABASE();

SHOW CREATE PROCEDURE GetStudentBookings;

-- Retrieve bookings for student ID 3
CALL GetStudentBookings(3);


-- =====================================================
-- SECTION 10: STORED FUNCTION
-- =====================================================

SHOW FUNCTION STATUS
WHERE Db = DATABASE();

SHOW CREATE FUNCTION GetBookingTotal;

-- Calculate the total for booking ID 5
SELECT GetBookingTotal(5) AS booking_total;


-- =====================================================
-- SECTION 11: VERIFY FOREIGN KEYS
-- =====================================================

SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;


-- =====================================================
-- SECTION 12: VERIFY CHECK CONSTRAINTS
-- =====================================================

SELECT
    tc.TABLE_NAME,
    tc.CONSTRAINT_NAME,
    cc.CHECK_CLAUSE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
JOIN INFORMATION_SCHEMA.CHECK_CONSTRAINTS cc
    ON tc.CONSTRAINT_SCHEMA = cc.CONSTRAINT_SCHEMA
    AND tc.CONSTRAINT_NAME = cc.CONSTRAINT_NAME
WHERE tc.CONSTRAINT_SCHEMA = DATABASE()
  AND tc.CONSTRAINT_TYPE = 'CHECK';


-- =====================================================
-- SECTION 13: VERIFY STORAGE ENGINE
-- =====================================================

SELECT
    TABLE_NAME,
    ENGINE
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_TYPE = 'BASE TABLE';


-- =====================================================
-- SECTION 14: TRANSACTION AND ROLLBACK DEMONSTRATION
-- =====================================================

START TRANSACTION;

UPDATE rides
SET cost_per_seat = 999
WHERE ride_id = 2;

-- Temporary value inside the transaction
SELECT ride_id, cost_per_seat
FROM rides
WHERE ride_id = 2;

-- Undo the temporary change
ROLLBACK;

-- Verify original value is restored
SELECT ride_id, cost_per_seat
FROM rides
WHERE ride_id = 2;


-- =====================================================
-- SECTION 15: FINAL DATABASE VERIFICATION
-- =====================================================

SELECT
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM vehicles) AS total_vehicles,
    (SELECT COUNT(*) FROM rides) AS total_rides,
    (SELECT COUNT(*) FROM bookings) AS total_bookings;

SELECT
    ride_id,
    pickup_location,
    destination,
    total_seats,
    available_seats,
    status
FROM rides
ORDER BY ride_id;

SELECT
    booking_status,
    COUNT(*) AS total
FROM bookings
GROUP BY booking_status;

-- =====================================================
-- END OF CAMPUSRIDE DEMONSTRATION
-- =====================================================
