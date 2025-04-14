const express = require('express');
const router = express.Router();
const examplesController = require('../../controllers/examplesController'); // Changed to examplesController
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');
const { uploadFile } = require('../../controllers/uploadController');

// Route: /api/examples
// router.route('/')
//     .get(examplesController.getAllExamples) // Changed from getAllCars to getAllExamples
//     .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), examplesController.createNewExample) // Changed from createNewCar to createNewExample
//     .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), examplesController.updateExample) // Changed from updateCar to updateExample
//     .delete(verifyRoles(ROLES_LIST.Admin), examplesController.deleteExample); // Changed from deleteCar to deleteExample

router.route('/')
    .get(examplesController.getAllExamples) // Changed from getAllCars to getAllExamples
    .post(examplesController.uploadMiddlewareWithUrl, examplesController.createNewExample) // Changed from createNewCar to createNewExample
    .put(examplesController.uploadMiddlewareWithUrl, examplesController.updateExample) // Changed from updateCar to updateExample
    .delete(examplesController.deleteExample); // Changed from deleteCar to deleteExample

router.route('/prices')
    .get(examplesController.getExamplePrices); // Changed from getCarPrices to getExamplePrices

router.route('/models')
    .get(examplesController.getExampleModels); // Changed from getCarPrices to getExamplePrices

router.route('/:id')
    .get(examplesController.getExampleById); // Changed from getCarById to getExampleById

module.exports = router;
