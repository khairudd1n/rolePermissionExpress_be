const pool = require('../db');

const nestMenus = (flatMenus) => {
  const menuMap = {};
  const rootMenus = [];

  flatMenus.forEach(menu => {
    menu.children = [];
    menuMap[menu.id] = menu;
  });

  flatMenus.forEach(menu => {
    if (menu.parent_id) {
      const parent = menuMap[menu.parent_id];
      if (parent) parent.children.push(menu);
    } else {
      rootMenus.push(menu);
    }
  });

  return rootMenus;
};

const getMenusByRole = async (req, res) => {
  const roleId = req.user.role_id;

  try {
    const result = await pool.query(
      `SELECT m.id, m.name, m.path, m.parent_id
       FROM role_menu rm
       JOIN menus m ON rm.menu_id = m.id
       WHERE rm.role_id = $1
       ORDER BY COALESCE(m.parent_id, m.id), m.order`,
      [roleId]
    );

    const nestedMenus = nestMenus(result.rows);
    res.json(nestedMenus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil menu' });
  }
};

const getAllMenus = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.id, m.name, m.path, m.parent_id,
        COALESCE(
          json_agg(
            json_build_object('id', c.id, 'name', c.name, 'parent_id', c.parent_id)
          ) FILTER (WHERE c.id IS NOT NULL), '[]'
        ) AS children
      FROM menus m
      LEFT JOIN menus c ON c.parent_id = m.id
      WHERE m.parent_id IS NULL
      GROUP BY m.id
      ORDER BY m.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil semua menu' });
  }
};

module.exports = { getMenusByRole, getAllMenus };
