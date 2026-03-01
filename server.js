const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();

// --- Middleware ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- MySQL Connection ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Habiba47', 
    database: 'lab_management'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('MySQL Connected successfully...');
});

// --- 1. HTML PAGE ROUTES (Navigation) ---

// Root route (Login Page)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Inventory
app.get('/inventory', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'inventory.html'));
});

// ************************************************************
// MODIFIED ROUTES: Requests, Maintenance, and Users
// ************************************************************

// Requests Page: Array use kiya hai taake singular/plural dono urls kaam karein
app.get(['/requests', '/request'], (req, res) => {
    const filePath = path.join(__dirname, 'public', 'requests.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error("File Error:", err.message);
            res.status(404).send("<h2 style='color:red;'>Error: requests.html missing in public folder!</h2>");
        }
    });
});

// Maintenance Page: Spelling typos (maintance) ko bhi handle kiya hai
app.get(['/maintenance', '/maintance'], (req, res) => {
    const filePath = path.join(__dirname, 'public', 'maintenance.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error("File Error:", err.message);
            res.status(404).send("<h2 style='color:red;'>Error: maintenance.html missing in public folder!</h2>");
        }
    });
});

// Users Page: Simple aur robust routing
app.get(['/users', '/user'], (req, res) => {
    const filePath = path.join(__dirname, 'public', 'users.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error("File Error:", err.message);
            res.status(404).send("<h2 style='color:red;'>Error: users.html missing in public folder!</h2>");
        }
    });
});

// API for Users Data (Table fill karne ke liye extra route)
app.get('/api/users', (req, res) => {
    const sql = 'SELECT id, name, email, role FROM users';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// ************************************************************

// Add Item Page
app.get('/add-item-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'add_item.html'));
});


// --- 2. AUTHENTICATION APIs ---

app.post('/signup', (req, res) => {
    const { name, email, password, role } = req.body;
    const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, email, password, role], (err) => {
        if (err) return res.status(500).send("Signup Error: Database Issue.");
        res.redirect('/'); 
    });
});

app.post('/login', (req, res) => {
    const { email, password, role } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND password = ? AND role = ?";
    db.query(sql, [email, password, role], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.redirect('/dashboard');
        } else {
            res.send("<script>alert('Invalid Credentials'); window.location.href='/';</script>");
        }
    });
});


// --- 3. INVENTORY & ASSETS APIs ---

app.get('/api/inventory', (req, res) => {
    const sql = 'SELECT * FROM inventory ORDER BY id DESC';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/add-item', (req, res) => {
    const { item_name, category, quantity } = req.body;
    const sql = "INSERT INTO inventory (item_name, category, quantity, status) VALUES (?, ?, ?, 'Available')";
    db.query(sql, [item_name, category, quantity], (err) => {
        if (err) return res.status(500).send("Database Error");
        res.redirect('/dashboard'); 
    });
});

app.get('/delete-item/:id', (req, res) => {
    const sql = "DELETE FROM inventory WHERE id = ?";
    db.query(sql, [req.params.id], (err) => {
        if (err) throw err;
        res.redirect('/inventory');
    });
});

app.post('/report-damage', (req, res) => {
    const { item_id } = req.body;
    const sql = "UPDATE inventory SET status = 'Damaged' WHERE id = ?";
    db.query(sql, [item_id], (err) => {
        if (err) return res.status(500).send("Error");
        res.send("Status Updated Successfully");
    });
});
// ************************************************************
// 4. REQUEST APIs (NEWLY ADDED - DO NOT MODIFY OTHER CODE)
// ************************************************************

// Get all requests
app.get('/api/requests', (req, res) => {
    const sql = "SELECT * FROM requests ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});


// User requests equipment
app.post('/request-item', (req, res) => {
    const { user_name, item_id, quantity } = req.body;

    // Check if item exists and has enough quantity
    const checkSql = "SELECT * FROM inventory WHERE id = ?";
    db.query(checkSql, [item_id], (err, results) => {
        if (err) return res.status(500).send("Database Error");

        if (results.length === 0) {
            return res.send("Item not found");
        }

        const item = results[0];

        if (item.quantity < quantity) {
            return res.send("Not enough quantity available");
        }

        // Insert request
        const insertSql = `
            INSERT INTO requests (user_name, item_id, item_name, quantity, request_date, status)
            VALUES (?, ?, ?, ?, CURDATE(), 'Pending')
        `;

        db.query(insertSql, [user_name, item_id, item.item_name, quantity], (err) => {
            if (err) return res.status(500).send("Error submitting request");
            res.send("Request submitted successfully");
        });
    });
});


// Approve Request
app.post('/approve-request/:id', (req, res) => {
    const requestId = req.params.id;

    const getRequest = "SELECT * FROM requests WHERE id = ?";
    db.query(getRequest, [requestId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(500).send("Request not found");
        }

        const request = results[0];

        if (request.status !== 'Pending') {
            return res.send("Request already processed");
        }

        // Reduce inventory quantity
        const updateInventory = `
            UPDATE inventory 
            SET quantity = quantity - ?
            WHERE id = ?
        `;

        db.query(updateInventory, [request.quantity, request.item_id], (err) => {
            if (err) return res.status(500).send("Inventory update failed");

            // Update request status
            const updateRequest = `
                UPDATE requests 
                SET status = 'Approved' 
                WHERE id = ?
            `;

            db.query(updateRequest, [requestId], (err) => {
                if (err) return res.status(500).send("Status update failed");
                res.send("Request Approved");
            });
        });
    });
});


// Reject Request
app.post('/reject-request/:id', (req, res) => {
    const sql = "UPDATE requests SET status = 'Rejected' WHERE id = ?";
    db.query(sql, [req.params.id], (err) => {
        if (err) return res.status(500).send("Error");
        res.send("Request Rejected");
    });
});

// --- Server Startup ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 LabFlow Server is running!`);
    console.log(`🔗 Click here: http://localhost:${PORT}`);
});