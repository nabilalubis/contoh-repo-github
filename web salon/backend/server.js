const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));

// Koneksi ke Database MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'salon_db'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to database!');
});

// Halaman Utama
app.get('/', (req, res) => {
    res.render('index');
});

// Halaman Login
app.get('/login', (req, res) => {
    res.render('login');
});

// Proses Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err || results.length === 0) {
            return res.render('login', { error: 'User not found' });
        }

        const user = results[0];
        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
            return res.render('login', { error: 'Invalid credentials' });
        }

        req.session.user = { id: user.id, role: user.role };

        if (user.role === 'Admin') {
            res.redirect('/admin');
        } else if (user.role === 'Customer') {
            res.redirect('/customer');
        } else if (user.role === 'Employee') {
            res.redirect('/employee');
        }
    });
});

// Halaman Admin
app.get('/admin', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Admin') {
        return res.redirect('/login');
    }
    res.render('admin');
});

// Halaman Customer
app.get('/customer', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Customer') {
        return res.redirect('/login');
    }

    const sql = 'SELECT * FROM services';
    db.query(sql, (err, services) => {
        if (err) throw err;
        res.render('customer', { services });
    });
});

// Halaman Employee
app.get('/employee', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Employee') {
        return res.redirect('/login');
    }
    res.render('employee');
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(Server running on http://localhost:${PORT});
});