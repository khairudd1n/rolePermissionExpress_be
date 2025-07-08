const pool = require('../db');

const getRoles = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM roles ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data roles' });
  }
};

const addRole = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Role name is required' });

    const existing = await pool.query('SELECT * FROM roles WHERE name = $1', [name]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Role already exists' });
    }

    const result = await pool.query('INSERT INTO roles (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add role' });
  }
};

const getPermissionsByRoleId = async (req, res) => {
  try {
    const roleId = req.params.id;
    const result = await pool.query(
      `SELECT m.id, m.name, m.path, m.parent_id
       FROM role_menu rm
       JOIN menus m ON m.id = rm.menu_id
       WHERE rm.role_id = $1`,
      [roleId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
};

const updatePermissionsByRoleId = async (req, res) => {
  const roleId = req.params.id;
  const { menuIds } = req.body; // array of menu_id

  if (!Array.isArray(menuIds)) {
    return res.status(400).json({ error: 'menuIds must be an array' });
  }

  try {
    await pool.query('BEGIN');
    await pool.query('DELETE FROM role_menu WHERE role_id = $1', [roleId]);

    for (const menuId of menuIds) {
      await pool.query('INSERT INTO role_menu (role_id, menu_id) VALUES ($1, $2)', [roleId, menuId]);
    }

    await pool.query('COMMIT');
    res.json({ message: 'Permissions updated' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to update permissions' });
  }
};

module.exports = { getRoles, addRole, getPermissionsByRoleId, updatePermissionsByRoleId };
