const express = require("express");
const registerController = require("../controllers/auth");
const loginController = require("../controllers/authlogin");
const router = express.Router();

router.post("/register", registerController.register);
router.post("/login", loginController.login);

module.exports = router;