const express = require('express');
const router = express.Router();
const reservationsController = require('../../controllers/reservationsController')

router.route('/')
    .get(reservationsController.getAllReservations)
    .post(reservationsController.createNewReservation)
    .put(reservationsController.updateReservation)
    .delete(reservationsController.deleteReservation);

    router.route('/codes')
    .get(reservationsController.getDistinctReservationCode)
    
    router.route('/statuses')
    .get(reservationsController.getDistinctReservationStatus)
    
    router.route('/offices')
    .get(reservationsController.getDistinctOffices)
// Routes for /api/categories/:id
router.route('/:id')
    .get(reservationsController.getReservationById);

module.exports = router;

