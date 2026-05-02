const express = require("express");
const router = express.Router();
const { getTasks, createTask, updateTaskStatus, getStats } = require("../controllers/taskController");
const { verifyToken, authorize } = require("../middlewares/authMiddleware");

router.get("/", verifyToken, getTasks);
router.get("/stats", verifyToken, getStats);
router.post("/", verifyToken, authorize(['admin']), createTask);
router.patch("/:id", verifyToken, updateTaskStatus);

module.exports = router;
