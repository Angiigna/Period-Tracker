const dotenv = require("dotenv");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")

dotenv.config({path: './.env'})

const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
})

exports.register = (req, res) => {
  console.log(req.body);

  const{name, email, password} = req.body;
  
  db.query('SELECT email FROM users WHERE email = ?', [email], async(error, results) => {
    if(error){
      console.log(error);
    }else{
      if(results.length > 0){
        return res.render('register', {message: 'Email already in use'
        });
      }else{
        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query('INSERT INTO users SET ?', {name: name, email: email, password: hashedPassword}, (error, results) => {
          if(error){
            console.log(error)
          }else{
            console.log(results);
            return res.render('homepage')//we have an issue submit always gives email already in use but it is not
          }
        })
      }
    }
  });
}

