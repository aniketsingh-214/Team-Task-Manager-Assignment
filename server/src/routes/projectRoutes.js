const express = require("express");
const router = express.Router();
const { getProjects, createProject, deleteProject } = require("../controllers/projectController");
const { verifyToken, authorize } = require("../middlewares/authMiddleware");

router.get("/", verifyToken, getProjects);
router.post("/", verifyToken, authorize(['admin']), createProject);
router.delete("/:id", verifyToken, authorize(['admin']), deleteProject);

module.exports = router;
