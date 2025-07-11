const dotenv = require("dotenv");
const mysql = require("mysql");

dotenv.config({ path: './.env' });

const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
});

// 🔹 Log the first day of a new cycle
exports.logPeriod = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized: User not logged in" });
  }

  const userId = req.session.user.id;
  const { period_start_date, cycle_length } = req.body;

  // Validate and use the input date as-is (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(period_start_date)) {
    console.error("Invalid date format:", period_start_date);
    return res.status(400).json({ error: "Invalid date format" });
  }
  const normalizedDate = period_start_date;

  console.log(`Logging period with date: ${normalizedDate}`);

  const insertPeriodQuery = `
    INSERT INTO PeriodLogs (user_id, period_start_date, cycle_length)
    VALUES (?, ?, ?)
  `;

  db.query(insertPeriodQuery, [userId, normalizedDate, cycle_length], async (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).json({ error: "Failed to log period" });
    }

    const periodId = result.insertId;

    try {
      await logDailyDetail(periodId, normalizedDate, cycle_length, userId);
      res.json({ message: "Period logged successfully", insertId: periodId });
    } catch (error) {
      console.error("Error logging period detail:", error);
      res.status(500).json({ error: "Failed to log daily detail" });
    }
  });
};

// 🔹 Internal function to log 1 day into PeriodDetails
const logDailyDetail = (periodId, date, cycle_length, userId) => {
  return new Promise((resolve, reject) => {
    // Use the input date as-is (YYYY-MM-DD)
    const normalizedDate = date;

    console.log(`Logging daily detail for date: ${normalizedDate}`);

    const query = `
      INSERT INTO PeriodDetails (user_id, period_start_date, period_end_date, cycle_length, logged_date, period_length)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [userId, normalizedDate, normalizedDate, cycle_length || 28, normalizedDate, 1], (err, result) => {
      if (err) {
        console.error("Error inserting daily detail:", err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// 🔹 Log daily period
exports.logDailyPeriod = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized: User not logged in" });
  }

  const userId = req.session.user.id;
  const { date } = req.body;

  // Validate and use the input date as-is (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    console.error("Invalid date format:", date);
    return res.status(400).json({ error: "Invalid date format" });
  }
  const normalizedDate = date;

  console.log(`Logging daily period for date: ${normalizedDate}`);

  const query = `
    INSERT INTO PeriodDetails (user_id, period_start_date, period_end_date, cycle_length, logged_date, period_length)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [userId, normalizedDate, normalizedDate, 28, normalizedDate, 1], (err, result) => {
    if (err) {
      console.error("Error logging daily period:", err);
      return res.status(500).json({ error: "Failed to log daily period" });
    }
    res.json({ message: "Daily period logged successfully" });
  });
};

// 🔹 Get the most recent logged period (for frontend checks)
exports.getLastPeriodLog = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized: User not logged in" });
  }

  const userId = req.session.user.id;

  const query = `
    SELECT * FROM PeriodLogs
    WHERE user_id = ?
    ORDER BY period_start_date DESC
    LIMIT 1
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results[0] || null);
  });
};

// 🔹 Get all logged period dates from PeriodDetails
exports.getLoggedPeriods = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized: User not logged in" });
  }

  const userId = req.session.user.id;

  const query = `
    SELECT DATE_FORMAT(logged_date, '%Y-%m-%d') AS logged_date
    FROM PeriodDetails
    WHERE user_id = ?
    ORDER BY logged_date
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching logged periods:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const loggedDates = results.map(row => row.logged_date);
    console.log('Raw query results:', results);
    console.log('Sending logged periods:', loggedDates);
    res.json(loggedDates);
  });
};

// 🔹 Get full calendar data (logged, predicted, ovulation, phases)
exports.getCalendarData = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized: User not logged in" });
  }

  const userId = req.session.user.id;

  // Fetch logs from PeriodDetails
  const periodDetailsQuery = `
    SELECT DATE_FORMAT(logged_date, '%Y-%m-%d') AS logged_date
    FROM PeriodDetails
    WHERE user_id = ?
    ORDER BY logged_date ASC
  `;

  db.query(periodDetailsQuery, [userId], (err, periodDetails) => {
    if (err) {
      console.error("Error fetching period details:", err);
      return res.status(500).json({ error: "DB error" });
    }

    // Clean date strings
    const loggedPeriodDates = new Set(periodDetails.map(p => p.logged_date));

    // Fetch the most recent period start date from PeriodLogs
    const latestPeriodQuery = `
      SELECT period_start_date, cycle_length
      FROM PeriodLogs
      WHERE user_id = ?
      ORDER BY period_start_date DESC
      LIMIT 1
    `;

    db.query(latestPeriodQuery, [userId], (err, latestPeriod) => {
      if (err) {
        console.error("Error fetching latest period:", err);
        return res.status(500).json({ error: "DB error" });
      }

      let predictedPeriods = [];
      let ovulation = null;
      let follicular = [];
      let luteal = [];

      if (latestPeriod.length > 0) {
        const latestPeriodDate = new Date(latestPeriod[0].period_start_date);
        const cycleLength = latestPeriod[0].cycle_length || 28;

        // Predicted period: 5 days starting from the latest period start date
        for (let i = 1; i < 6; i++) {
          const periodDay = new Date(latestPeriodDate);
          periodDay.setDate(latestPeriodDate.getDate() + i);
          predictedPeriods.push(periodDay.toISOString().split("T")[0]);
        }

        // Ovulation: ~14 days after the latest period start date
        const ovulationDate = new Date(latestPeriodDate);
        ovulationDate.setDate(latestPeriodDate.getDate() + 14);
        ovulation = ovulationDate.toISOString().split("T")[0];

        // Follicular phase: Day after period (day 6) to ovulation (day 14)
        const follicularStart = new Date(latestPeriodDate);
        follicularStart.setDate(latestPeriodDate.getDate() + 5);
        let currentDate = new Date(follicularStart);
        while (currentDate <= ovulationDate) {
          follicular.push(currentDate.toISOString().split("T")[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Luteal phase: Day after ovulation to next period
        const lutealStart = new Date(ovulationDate);
        lutealStart.setDate(ovulationDate.getDate() + 1);
        const nextPeriodDate = new Date(latestPeriodDate);
        nextPeriodDate.setDate(latestPeriodDate.getDate() + cycleLength);
        currentDate = new Date(lutealStart);
        while (currentDate < nextPeriodDate) {
          luteal.push(currentDate.toISOString().split("T")[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Next period: Start of the next cycle
        for (let i = 0; i < 5; i++) {
          const nextPeriodDay = new Date(nextPeriodDate);
          nextPeriodDay.setDate(nextPeriodDate.getDate() + i);
          predictedPeriods.push(nextPeriodDay.toISOString().split("T")[0]);
        }
      }

      const responseData = {
        periodLogs: Array.from(loggedPeriodDates),
        predictedPeriods,
        ovulation,
        follicular,
        luteal,
      };
      console.log('Sending calendar data:', responseData);
      res.json(responseData);
    });
  });
};