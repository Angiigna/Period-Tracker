const express = require("express");
const mysql = require("mysql");
const path = require("path");
const dotenv = require("dotenv");
const session = require("express-session");

dotenv.config({ path: './.env' });

const app = express();

// Session configuration
app.use(session({
  secret: 'lunaria-secret',
  resave: false,
  saveUninitialized: false,
}));

// Middleware for static files, parsing, and JSON handling
const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set view engine
app.set('view engine', 'hbs');

// Route configurations
app.use("/", require('./routes/path'));
app.use("/register", require('./routes/path'));
app.use("/auth", require('./routes/auth'));

// Period Routes
const periodRoutes = require("./routes/periodRoutes");
app.use("/api/periods", periodRoutes);

// Mood Routes
const moodRoutes = require('./routes/moodroutes');
app.use('/api/mood', moodRoutes);

//vital routes
const vitalsRoutes = require('./routes/vitals');
app.use('/api', vitalsRoutes);


// MySQL Database Connection
const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
});

db.connect((error) => {
  if (error) {
    console.error("Connection error:", error);
  } else {
    console.log("Connected to MySQL");
  }
});

// Server startup
app.listen(5001, () => {
  console.log("Server running on port 5001");
});
