const pool = require("../config/db");

exports.getTasks = async (req, res) => {
  try {
    const { project_id } = req.query;
    let query = "SELECT t.*, u.name as assigned_to_name, p.name as project_name FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id LEFT JOIN projects p ON t.project_id = p.id";
    let params = [];
    let whereClauses = [];

    if (req.user.role === 'member') {
      whereClauses.push(`t.assigned_to = $${params.length + 1}`);
      params.push(req.user.id);
    } else if (req.query.user_id) {
      whereClauses.push(`t.assigned_to = $${params.length + 1}`);
      params.push(req.query.user_id);
    }

    if (project_id) {
      whereClauses.push(`t.project_id = $${params.length + 1}`);
      params.push(project_id);
    }

    if (whereClauses.length > 0) {
      query += " WHERE " + whereClauses.join(" AND ");
    }

    query += " ORDER BY t.due_date ASC";
    
    const tasks = await pool.query(query, params);
    res.json(tasks.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
};

exports.createTask = async (req, res) => {
  const { title, description, status, assigned_to, project_id, due_date } = req.body;
  try {
    const newTask = await pool.query(
      "INSERT INTO tasks (title, description, status, assigned_to, project_id, due_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, description, status || 'todo', assigned_to, project_id, due_date]
    );
    res.status(201).json(newTask.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating task" });
  }
};

exports.updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updatedTask = await pool.query(
      "UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    if (updatedTask.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(updatedTask.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error updating task status" });
  }
};

exports.getStats = async (req, res) => {
  try {
    let query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'done') as completed,
        COUNT(*) FILTER (WHERE status != 'done' AND due_date < CURRENT_TIMESTAMP) as overdue,
        COUNT(*) FILTER (WHERE status = 'todo') as todo,
        COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress
      FROM tasks
    `;
    let params = [];
    
    if (req.user.role === 'member') {
      query += " WHERE assigned_to = $1";
      params.push(req.user.id);
    } else if (req.query.user_id) {
      query += " WHERE assigned_to = $1";
      params.push(req.query.user_id);
    }

    const stats = await pool.query(query, params);
    res.json(stats.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
};
