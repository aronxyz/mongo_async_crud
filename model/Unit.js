const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
    tuition: {
        type: String,
        required: true,
        unique: true
    },
    exampleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Example', // Reference to the CarModel schema
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    rentState: {
        type: String,
        enum: ['Rented', 'Reservated', 'Not available', 'Available'],
        required: true
    },
    cleanState: {
        type: String,
        enum: ['Check In', 'Check Out', 'Out of Order'],
        default: 'Check In'
    },
    currentReservation: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reservation',
            default: [] // Initialize as an empty array
        }
    ],
    ubication: {
        type: {
            type: String,
            enum: ['Taller', 'Parking', 'Nave', 'Arrendado'],
            required: true
        },
        spot: {
            type: String,
            default: null
        }
    }
}, { timestamps: true }); // Add timestamps

// Pre-save hook to enforce the constraints
unitSchema.pre('save', function (next) {
    const { rentState, cleanState, ubication } = this;

    const validConstraints = {
        Rented: { cleanState: ['Check In'], ubication: ['Arrendado'] },
        Reservated: { cleanState: ['Check In', 'Check Out'], ubication: ['Parking', 'Nave'] },
        'Not available': { cleanState: ['Out of Order'], ubication: ['Nave', 'Parking', 'Taller'] },
        Available: { cleanState: ['Check In', 'Check Out'], ubication: ['Parking', 'Nave'] }
    };

    const validUbication = validConstraints[rentState]?.ubication;
    const validCleanState = validConstraints[rentState]?.cleanState;

    // Check if the combination of cleanState and ubication is valid for the rentState
    if (!validUbication?.includes(ubication.type) || !validCleanState?.includes(cleanState)) {
        return next(new Error(`Invalid combination of rentState '${rentState}', cleanState '${cleanState}', and ubication '${ubication.type}'`));
    }

    // Proceed to save if everything is valid
    next();
});

const Unit = mongoose.model('Unit', unitSchema);

module.exports = Unit;
