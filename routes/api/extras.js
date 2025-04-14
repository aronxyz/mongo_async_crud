const express = require('express');
const router = express.Router();
const extrasController = require('../../controllers/extrasController'); // Updated to reflect the correct controller name
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

// Route: /api/extras
// router.route('/')
//     .get(extrasController.getAllExtras)  // Public: Get all extras
//     .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), extrasController.createNewExtra)  // Admin/Editor: Create a new extra
//     .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), extrasController.updateExtra)  // Admin/Editor: Update an existing extra
//     .delete(verifyRoles(ROLES_LIST.Admin), extrasController.deleteExtra);  // Admin: Delete an extra

// Test Route: uncomment above for actual use with roles
router.route('/')
    .get(extrasController.getAllExtras) // Get all extras
    .post(extrasController.createNewExtra) // Create a new extra
    .put(extrasController.updateExtra) // Update an existing extra
    .delete(extrasController.deleteExtra); // Delete an extra

// Route: /api/extras/:id
router.route('/:id')
    .get(extrasController.getExtraById); // Get a specific extra by ID

module.exports = router;
