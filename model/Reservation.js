const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reservationSchema = new Schema({
    reservationCode: {
       type: String,
       required: true 
    },
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'Client', // Reference to the Client model
        required: true
    },
    unitId: {
        type: Schema.Types.ObjectId,
        ref: 'Unit', // Reference to the Unit model
        required: true
    },
    pickupOffice: {
        type: String,
        required: true
    },
    returnOffice: {
        type: String, // Can be optional or required based on your requirements
        default: ''
    },
    pickupDate: {
        type: Date,
        required: true
    },
    pickupTime: {
        type: String, // Can use a string format (e.g., 'HH:MM')
        required: true
    },
    returnDate: {
        type: Date,
        required: true
    },
    returnTime: {
        type: String, // Can use a string format (e.g., 'HH:MM')
        required: true
    },
    reservationStatus: {
        type: String,
        enum: ['Pending', 'Check In', 'Check Out', 'Cancelled'], // Allowed statuses with capitalized first letter
        required: true,
        default: 'Pending' // Default status when created
    },
    tenure: {
        type: Number, // or String, depending on how you want to represent it
        required: true
    },
    extras: [{
        _id: false,
        extraId: {
            type: Schema.Types.ObjectId,
            ref: 'Extra', // Reference to the Extra model
            required: true // Make this field required
        },
        quantity: {
            type: Number,
            default: 1 // Default quantity if not specified
        }
    }],
    total: {
        type: Number,
        required: true,
        default: 0 // Default total, can be calculated based on other fields
    }
});

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
