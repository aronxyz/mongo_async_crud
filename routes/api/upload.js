const express = require('express');
const { uploadFile } = require('../../controllers/uploadController');

const router = express.Router();

// Define the upload route
router.post('/', uploadFile);

module.exports = router;
