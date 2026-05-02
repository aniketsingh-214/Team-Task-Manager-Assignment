const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const adminExists = await pool.query("SELECT * FROM admins WHERE email = $1", [email]);
    
    if (userExists.rows.length > 0 || adminExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );

    const token = jwt.sign(
      { id: newUser.rows[0].id, role: 'member' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      user: { ...newUser.rows[0], role: 'member' }, 
      token 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during signup." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check Admins Table First
    const adminResult = await pool.query("SELECT * FROM admins WHERE email = $1", [email]);
    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      const isMatch = await bcrypt.compare(password, admin.password);
      if (isMatch) {
        const token = jwt.sign(
          { id: admin.id, role: 'admin' },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({
          user: { id: admin.id, name: admin.name, email: admin.email, role: 'admin' },
          token
        });
      }
    }

    // 2. Check Users Table
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const token = jwt.sign(
          { id: user.id, role: 'member' },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({
          user: { id: user.id, name: user.name, email: user.email, role: 'member' },
          token
        });
      }
    }

    // If neither matched
    return res.status(400).json({ message: "Invalid email or password." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login." });
  }
};

exports.getMe = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const adminResult = await pool.query("SELECT id, name, email FROM admins WHERE id = $1", [req.user.id]);
      if (adminResult.rows.length === 0) return res.status(404).json({ message: "Admin not found." });
      return res.json({ ...adminResult.rows[0], role: 'admin' });
    } else {
      const userResult = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [req.user.id]);
      if (userResult.rows.length === 0) return res.status(404).json({ message: "User not found." });
      return res.json({ ...userResult.rows[0], role: 'member' });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    // Only return regular users, inject 'member' as role for frontend dropdowns
    const usersResult = await pool.query("SELECT id, name, email, 'member' as role FROM users ORDER BY name ASC");
    res.json(usersResult.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching users." });
  }
};
