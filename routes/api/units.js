const express = require('express');
const router = express.Router();
const unitController = require('../../controllers/unitsController'); // Updated to unitController
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

// // Route: /api/unit
// router.route('/')
//     .get(unitController.getAllUnits) // Public: Get all unit entries
//     .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), unitController.createUnit) // Admin/Editor: Create a new unit entry
//     .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), unitController.updateUnit) // Admin/Editor: Update an existing unit entry
//     .delete(verifyRoles(ROLES_LIST.Admin), unitController.deleteUnit); // Admin: Delete a unit entry

// // Route: /api/unit/:id
// router.route('/:id')
//     .get(unitController.getUnitById) // Public: Get a specific unit entry by ID
//     .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), unitController.updateUnit) // Admin/Editor: Update a specific unit entry
//     .delete(verifyRoles(ROLES_LIST.Admin), unitController.deleteUnit); // Admin: Delete a specific unit entry

// Route: /api/unit
router.route('/')
    .get(unitController.getAllUnits) // Public: Get all unit entries
    .post(unitController.createUnit) // Admin/Editor: Create a new unit entry
    .put(unitController.updateUnit) // Admin/Editor: Update an existing unit entry
    .delete(unitController.deleteUnit); // Admin: Delete a unit entry

router.route('/tuitions')
    .get(unitController.getDistinctTuition); // Changed from getCarPrices to getExamplePrices
router.route('/clean-states')
    .get(unitController.getDistinctCleanState); // Changed from getCarPrices to getExamplePrices
router.route('/rent-states')
    .get(unitController.getDistinctRentState); // Changed from getCarPrices to getExamplePrices

// Route: /api/unit/available-car/:modelId
router.route('/available-unit/:exampleId')
    .get(unitController.findAvailableUnitByModelAndReservationTerm); // Public: Get an available car for a specific model

module.exports = router;
