const express = require('express');
const router = express.Router();
const clientsController = require('../../controllers/clientsController')

router.route('/')
    .get(clientsController.getAllClients)
    .post(clientsController.createNewClient)
    .put(clientsController.updateClient)
    .delete(clientsController.deleteClient);

// Routes for /api/categories/:id
router.route('/:id')
    .get(clientsController.getClientById);

module.exports = router;