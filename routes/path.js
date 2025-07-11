const express = require('express');
const router = express.Router();

router.get('/userhome', (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render('userhome', { user: req.session.user });
});
router.get('/', (req, res) => {
  res.render('homepage');
});
router.get('/register', (req, res) =>{
  res.render('register');
})
router.get('/login', (req,res) => {
  res.render('login');
})

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Failed to logout');
    }
    res.redirect('/');
  });
});


module.exports = router;