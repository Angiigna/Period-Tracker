const dotenv = require("dotenv");
const mysql = require("mysql");

dotenv.config({ path: './.env' });

const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
});

exports.saveVitals = async (req, res) => {
  const user = req.session.user;
  console.log('Session user:', user);
  console.log('Request body:', req.body);

  if (!user) {
    return res.status(401).json({ error: 'User not logged in' });
  }

  const { age, height, weight, rhr, bmi } = req.body;

  if (!age || !height || !weight || !rhr || !bmi) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.query(
    'INSERT INTO vitals (user_id, age, height, weight, rhr, bmi) VALUES (?, ?, ?, ?, ?, ?)',
    [user.id, age, height, weight, rhr, bmi],
    (err, result) => {
      if (err) {
        console.error('Database insert error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      console.log('Vitals saved');
      res.status(200).json({ message: 'Vitals saved successfully' });
    }
  );
};

exports.getVitals = (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.status(401).json({ error: 'User not logged in' });
  }

  db.query(
    'SELECT * FROM vitals WHERE user_id = ? ORDER BY id DESC LIMIT 1',
    [user.id],
    (err, results) => {
      if (err) {
        console.error('Vitals fetch error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'No vitals found' });
      }

      res.json(results[0]);
    }
  );
};