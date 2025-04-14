const express = require('express');
const router = express.Router();
const categoriesController = require('../../controllers/categoriesController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

// Routes for /api/categories
// router.route('/')
//     .get(categoriesController.getAllCategories)
//     .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), categoriesController.createNewCategory)
//     .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), categoriesController.updateCategory)
//     .delete(verifyRoles(ROLES_LIST.Admin), categoriesController.deleteCategory);

router.route('/')
    .get(categoriesController.getAllCategories)
    .post(categoriesController.createNewCategory)
    .put(categoriesController.updateCategory)
    .delete(categoriesController.deleteCategory);

// Routes for /api/categories/:id
router.route('/:id')
    .get(categoriesController.getCategory);

module.exports = router;
