const express = require('express');
     const router = express.Router();
     const mysql = require('mysql');
     const dotenv = require('dotenv');

     dotenv.config();

     // New connection
     const db = mysql.createConnection({
       host: process.env.HOST,
       user: process.env.USER,
       password: process.env.PASSWORD,
       database: process.env.DATABASE
     });

     db.connect((err) => {
       if (err) {
         console.error('MySQL connection error (mood route):', err);
       } else {
         console.log('Connected to MySQL (mood route)');
       }
     });

     // POST /api/mood
     router.post('/', (req, res) => {
       const { userId, date, mood } = req.body;

       if (!userId || !date || mood === undefined) {
         return res.status(400).json({ error: 'Missing required fields' });
       }

       const checkSql = 'SELECT * FROM moods WHERE user_id = ? AND date = ?';
       db.query(checkSql, [userId, date], (err, results) => {
         if (err) return res.status(500).json({ error: 'Database error (select)' });

         if (results.length > 0) {
           const updateSql = 'UPDATE moods SET mood = ? WHERE user_id = ? AND date = ?';
           db.query(updateSql, [mood, userId, date], (err) => {
             if (err) return res.status(500).json({ error: 'Database error (update)' });
             return res.json({ message: 'Mood updated successfully' });
           });
         } else {
           const insertSql = 'INSERT INTO moods (user_id, date, mood) VALUES (?, ?, ?)';
           db.query(insertSql, [userId, date, mood], (err) => {
             if (err) return res.status(500).json({ error: 'Database error (insert)' });
             return res.json({ message: 'Mood recorded successfully' });
           });
         }
       });
     });

     // GET /api/mood
     router.get('/', (req, res) => {
       const { userId } = req.query;

       if (!userId) {
         return res.status(400).json({ error: 'Missing userId' });
       }

       const sql = 'SELECT DATE_FORMAT(date, "%Y-%m-%d") AS date, mood FROM moods WHERE user_id = ? ORDER BY date DESC';
       db.query(sql, [userId], (err, results) => {
         if (err) return res.status(500).json({ error: 'Database error (select)' });
         res.json(results);
       });
     });

     module.exports = router;