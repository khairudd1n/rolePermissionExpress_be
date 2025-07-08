const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getMenusByRole, getAllMenus } = require('../controllers/menuController');

router.get('/menus', authMiddleware, getMenusByRole);
router.get('/menus/all', getAllMenus);

module.exports = router;
