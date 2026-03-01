CREATE DATABASE lab_management;
USE lab_management;

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role ENUM('Admin', 'Lab Incharge', 'Faculty', 'Student')
);

-- Inventory Table
CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(100),
    category VARCHAR(50),
    status ENUM('Available', 'Issued', 'Damaged', 'Under Maintenance') DEFAULT 'Available',
    quantity INT DEFAULT 1
);
CREATE TABLE requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    item_id INT,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES inventory(id)
);
-- Join tables to see student name and item name together
SELECT requests.request_id, users.name AS student_name, inventory.item_name, requests.status 
FROM requests 
JOIN users ON requests.user_id = users.id 
JOIN inventory ON requests.item_id = inventory.id 
WHERE requests.status = 'Pending';
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity INT DEFAULT 1,
    status ENUM('Available', 'Issued', 'Damaged') DEFAULT 'Available'
);
DROP TABLE requests;
CREATE TABLE requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100),
    item_id INT,
    item_name VARCHAR(100),
    quantity INT,
    request_date DATE,
    status VARCHAR(50) DEFAULT 'Pending'
);

