const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const registerUser  = async (req, res) => {
  try {
    const { username, email, password, role_id } = req.body; // Include role_id
    
    // Validation
    if (!role_id) return res.status(400).json({ error: 'Role ID is required' });

    const user_username = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (user_username.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const user_email = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user_email.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser  = await pool.query(
      'INSERT INTO users (username, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, hashedPassword, role_id]
    );

    // Get role name to include in JWT
    const role = await pool.query('SELECT name FROM roles WHERE id = $1', [role_id]);

    const token = jwt.sign(
      {
        id: newUser .rows[0].id,
        role_id: newUser .rows[0].role_id,
        role_name: role.rows[0].name
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, user: newUser .rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// User login
const loginUser  = async (req, res) => {
  try {
    const { username, password } = req.body;

    const userQuery = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userQuery.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userQuery.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get role name
    const role = await pool.query('SELECT name FROM roles WHERE id = $1', [user.role_id]);

    const token = jwt.sign(
      {
        id: user.id,
        role_id: user.role_id,
        role_name: role.rows[0].name
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { registerUser , loginUser  };
