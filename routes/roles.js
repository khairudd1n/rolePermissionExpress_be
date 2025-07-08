const express = require('express');
const router = express.Router();
const {
  getRoles,
  addRole,
  getPermissionsByRoleId,
  updatePermissionsByRoleId
} = require('../controllers/roleController');

router.get('/roles', getRoles);
router.post('/roles', addRole);
router.get('/roles/:id/permissions', getPermissionsByRoleId);
router.post('/roles/:id/permissions', updatePermissionsByRoleId);

module.exports = router;
