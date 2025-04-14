const Reservation = require('../model/Reservation'); // Adjust the path if necessary
const Client = require('../model/Client')
const Unit = require('../model/Unit')

const generateUniqueId = async () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let uniqueId;
    let exists = true;

    // Loop until we find a unique ID
    while (exists) {
        uniqueId = Array.from({ length: 8 }, () => 
            characters.charAt(Math.floor(Math.random() * characters.length))
        ).join('');

        // Check if this unique ID already exists
        exists = await Reservation.exists({ uniqueIdentifier: uniqueId });
    }

    return uniqueId;
};

// Create a new reservation
const createNewReservation = async (req, res) => {
    console.log(req.body);
    try {
        const { client: clientData, unitId, ...reservationData } = req.body; // Extract unitId and destructure client data
        const { drivingLicenseNumber } = clientData;

        // Step 1: Look for an existing client by drivingLicenseNumber
        let client = await Client.findOne({ drivingLicenseNumber });

        if (client) {
            // Step 2: Compare and update client fields if necessary
            const fieldsToUpdate = {};
            for (const key in clientData) {
                if (clientData[key] !== client[key]) {
                    fieldsToUpdate[key] = clientData[key];
                }
            }

            if (Object.keys(fieldsToUpdate).length > 0) {
                // Update the client if there are differences
                client = await Client.findByIdAndUpdate(client._id, fieldsToUpdate, { new: true });
            }
        } else {
            // Step 3: Create a new client if none was found
            client = new Client(clientData);
            await client.save();
        }

        // Step 4: Check if the unit is available
        const unit = await Unit.findById(unitId).populate('currentReservation'); // Fetch the unit with current reservations

        if (!unit) {
            return res.status(404).json({ error: 'Unit not found' });
        }

        // Step 5: Generate a unique 8-character identifier
        const uniqueIdentifier = await generateUniqueId();

        // Step 5: Create the reservation with the correct client ID
        const reservation = new Reservation({
            ...reservationData,
            reservationCode: uniqueIdentifier,
            unitId: unit._id,
            clientId: client._id, // Use the client's ID
        });
        await reservation.save();

        // Step 6: Update the unit's rentState to "Reservated" if it is not already rented or reservated
        if (unit.rentState !== 'Rented' && unit.rentState !== 'Reservated') {
            unit.rentState = 'Reservated'; // Set to "Reservated"
            await unit.save(); // Save the updated unit
        }

        // Step 7: Add the new reservation ID to the unit's currentReservation array
        await Unit.findByIdAndUpdate(unitId, {
            $push: { currentReservation: reservation._id } // Push the new reservation ID to the array
        });

        // Step 8: Return the created reservation with specific fields
        const response = {
            reservationCode: uniqueIdentifier,
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email,
            pickupOffice: reservationData.pickupOffice, // Assuming this is part of reservationData
            pickupDate: reservationData.pickupDate, // Assuming this is part of reservationData
            pickupTime: reservationData.pickupTime, // Assuming this is part of reservationData
        };

        console.log(response)
        res.status(201).json(response);
    } catch (error) {
        // Handle any errors and return a 400 status
        console.error("Error creating reservation:", error);
        res.status(400).json({ error: error.message });
    }
};

// Get all reservations
const dayjs = require('dayjs'); // You may need to install dayjs for date formatting

const getAllReservations = async (req, res) => {
    try {
        const { 
            reservationCode, 
            pickupOffice, 
            pickupDate, 
            pickupTime, 
            returnOffice, 
            returnDate, 
            returnTime, 
            reservationStatus, 
            page, 
            limit 
        } = req.query;

        // Create a query object to hold filters
        let query = {};

        // Add _id filter if provided
        if (reservationCode) {
            query.reservationCode = reservationCode;
        }

        // Add pickupOffice filter if provided
        if (pickupOffice) {
            query.pickupOffice = pickupOffice;
        }

        // Add pickupDate filter if provided (assuming pickupDate is in YYYY-MM-DD format)
        if (pickupDate) {
            query.pickupDate = dayjs(pickupDate).startOf('day').toDate(); // Convert to Date object
        }

        // Add pickupTime filter if provided
        if (pickupTime) {
            query.pickupTime = pickupTime; // Assuming pickupTime is already in the desired format
        }

        // Add returnOffice filter if provided
        if (returnOffice) {
            query.returnOffice = returnOffice;
        }

        // Add returnDate filter if provided (assuming returnDate is in YYYY-MM-DD format)
        if (returnDate) {
            query.returnDate = dayjs(returnDate).startOf('day').toDate(); // Convert to Date object
        }

        // Add returnTime filter if provided
        if (returnTime) {
            query.returnTime = returnTime; // Assuming returnTime is already in the desired format
        }

        // Add reservationStatus filter if provided
        if (reservationStatus) {
            query.reservationStatus = reservationStatus;
        }

        console.log("Query", query);

        // Set up pagination
        const skip = page ? (Number(page) - 1) * (limit ? Number(limit) : 0) : 0; // Calculate skip only if page is provided
        const options = {
            ...(limit ? { limit: Number(limit) } : {}), // Include limit only if provided
            ...(page ? { skip } : {}) // Include skip only if page is provided
        };

        // Count total matching documents
        const rowCount = await Reservation.countDocuments(query);

        // Retrieve reservations with filters and pagination
        const reservations = await Reservation.find(query)
            .populate('clientId')  // Example of populating related data, adjust according to your schema
            .populate('unitId')
            .populate('extras.extraId')
            .setOptions(options); // Using setOptions allows for dynamic application of pagination

        if (!reservations || reservations.length === 0) {
            return res.status(204).json({ message: 'No reservations found.' });
        }

        res.json({
            reservations,
            rowCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving reservations.' });
    }
};

// Get a reservation by ID
const getReservationById = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate('client unit');
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        res.status(200).json(reservation); // Return the reservation
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a reservation
const updateReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        res.status(200).json(reservation); // Return the updated reservation
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a reservation
const deleteReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndDelete(req.params.id);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        res.status(204).send(); // No content, reservation successfully deleted
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getDistinctReservationCode = async (req, res) => {
    try {
        const reservationCodes = await Reservation.distinct('reservationCode');

        if (!reservationCodes || reservationCodes.length === 0) {
            return res.status(204).json({ 'message': 'No reservationCodes found.' });
        }

        res.json(reservationCodes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error retrieving reservationCodes.' });
    }
}

const getDistinctReservationStatus = async (req, res) => {
    try {
        const reservationStatuses = ['Pending', 'Check In', 'Check Out', 'Cancelled']

        if (!reservationStatuses || reservationStatuses.length === 0) {
            return res.status(204).json({ 'message': 'No reservationStatus found.' });
        }

        res.json(reservationStatuses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error retrieving reservationStatus.' });
    }
}

const getDistinctOffices = async (req, res) => {
    try {
        const pickupOffices = ['Tenerife Norte', 'Tenerife Sur']

        if (!pickupOffices || pickupOffices.length === 0) {
            return res.status(204).json({ 'message': 'No pickupOffice found.' });
        }

        res.json(pickupOffices);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error retrieving pickupOffice.' });
    }
}

module.exports = {
    createNewReservation,
    getAllReservations,
    getReservationById,
    updateReservation,
    deleteReservation,
    getDistinctReservationCode,
    getDistinctReservationStatus,
    getDistinctOffices
};
