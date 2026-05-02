const express = require("express");
const router = express.Router();
const { signup, login, getMe, getAllUsers } = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", verifyToken, getMe);
router.get("/users", verifyToken, getAllUsers);

module.exports = router;
