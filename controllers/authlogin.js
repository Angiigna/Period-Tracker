const dotenv = require("dotenv");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

dotenv.config({path: './.env'});
const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
})

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('login', {
      message: 'Please enter both email and password'
    });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
    if (error) {
      console.log(error);
      return res.render('login', {
        message: 'An error occurred during login'
      });
    } 
    
    if (results.length > 0) {
      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // Set the session user info
        req.session.user = {
          id: user.id,
          name: user.name,
          email: user.email
        };

        // Fetch the user's vitals data
        db.query('SELECT * FROM vitals WHERE user_id = ? ORDER BY id DESC LIMIT 1', [user.id], (err, vitalsResults) => {
          if (err) {
            console.log('Error fetching vitals:', err);
            return res.render('userhome', { 
              user: req.session.user,
              vitals: null,
              helpers: {
                json: function(context) {
                  return JSON.stringify(context);
                }
              }
            });
          }

          // Log the vitals data to check if it's being fetched
          console.log('Vitals data:', vitalsResults);

          // Pass the vitals data to the view if found
          const vitals = vitalsResults.length > 0 ? vitalsResults[0] : null;

          // Render the user's home page with vitals data
          return res.render('userhome', {
            user: req.session.user,
            vitals: vitals,
            helpers: {
              json: function(context) {
                return JSON.stringify(context);
              }
            }
          });
        });
      } else {
        return res.render('homepage', {
          message: 'Incorrect password'
        });
      }
    } else {
      return res.render('login', {
        message: 'Email is not registered'
      });
    }
  });
};