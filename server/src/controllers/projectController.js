const pool = require("../config/db");

exports.getProjects = async (req, res) => {
  try {
    const projects = await pool.query(
      "SELECT p.*, a.name as creator_name FROM projects p JOIN admins a ON p.created_by = a.id ORDER BY p.created_at DESC"
    );
    res.json(projects.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects" });
  }
};

exports.createProject = async (req, res) => {
  const { name } = req.body;
  try {
    const newProject = await pool.query(
      "INSERT INTO projects (name, created_by) VALUES ($1, $2) RETURNING *",
      [name, req.user.id]
    );
    res.status(201).json(newProject.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error creating project" });
  }
};

exports.deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
    // First delete associated tasks or the DB should handle it with ON DELETE CASCADE
    await pool.query("DELETE FROM tasks WHERE project_id = $1", [id]);
    const result = await pool.query("DELETE FROM projects WHERE id = $1 RETURNING *", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting project" });
  }
};
