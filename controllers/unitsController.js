const Unit = require('../model/Unit');
const Example = require('../model/Example'); // Changed Car to Example
const dayjs = require('dayjs')

// Create a new Unit entry
const createUnit = async (req, res) => {
    try {
        const { tuition, exampleId, categoryId, rentState, cleanState, ubication, spot } = req.body;

        // Check if the referenced Example model exists
        const exampleModel = await Example.findById(exampleId);
        if (!exampleModel) {
            return res.status(404).json({ message: 'Example model not found' });
        }

        const unit = new Unit({
            tuition,
            exampleId,
            categoryId,
            rentState,
            cleanState,
            ubication,
            spot
        });

        await unit.save();
        return res.status(201).json(unit);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Update a Unit entry
const updateUnit = async (req, res) => {
    try {
        const { tuition, exampleId, categoryId, rentState, cleanState, ubication, spot } = req.body;

        const unit = await Unit.findById(req.params.id);
        if (!unit) {
            return res.status(404).json({ message: 'Unit not found' });
        }

        // If exampleId is updated, check if the new Example model exists
        if (exampleId && exampleId !== unit.exampleId.toString()) {
            const exampleModel = await Example.findById(exampleId);
            if (!exampleModel) {
                return res.status(404).json({ message: 'Example model not found' });
            }
            unit.exampleId = exampleId;
        }

        unit.tuition = tuition || unit.tuition;
        unit.categoryId = categoryId || unit.categoryId;
        unit.rentState = rentState || unit.rentState;
        unit.cleanState = cleanState || unit.cleanState;
        unit.ubication.type = ubication || unit.ubication.type;
        unit.ubication.spot = spot || unit.ubication.spot;

        await unit.save();
        return res.status(200).json(unit);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Find available Unit by exampleId
const findAvailableUnitByModelAndReservationTerm = async (req, res) => {
    const { exampleId } = req.params;
    const { pickupDate, returnDate } = req.query;

    try {
        const parsedPickupDate = dayjs(pickupDate);
        const parsedReturnDate = dayjs(returnDate);

        const availableUnits = await Unit.find({
            exampleId, // Match the example model ID
            cleanState: { $in: ['Check In', 'Check Out'] },
        }).populate('exampleId currentReservation'); // Populate to get example and reservation details

        for (let unit of availableUnits) {
            const hasReservationConflict = unit.currentReservation && unit.currentReservation.some(reservation => {
                const resPickupDate = dayjs(reservation.pickupDate);
                const resReturnDate = dayjs(reservation.returnDate);

                return parsedPickupDate.isBefore(resReturnDate) && parsedReturnDate.isAfter(resPickupDate);
            });

            if (!hasReservationConflict) {
                return res.status(200).json(unit);
            }
        }

        return res.status(404).json({ message: 'No available unit found for this model and reservation term' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getDistinctTuition = async (req, res) => {
    try {
        const tuitions = await Unit.distinct('tuition');

        if (!tuitions || tuitions.length === 0) {
            return res.status(204).json({ 'message': 'No tuitions found.' });
        }

        res.json(tuitions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error retrieving tuitions ' });
    }
}

const getDistinctCleanState= async (req, res) => {
    try {
        const cleanStates = ['Check In', 'Check Out', 'Out of Order']

        if (!cleanStates || cleanStates.length === 0) {
            return res.status(204).json({ 'message': 'No cleanStates found.' });
        }

        res.json(cleanStates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error retrieving cleanStates ' });
    }
}

const getDistinctRentState= async (req, res) => {
    try {
        const rentStates = ['Rented', 'Reservated', 'Not available', 'Available']

        if (!rentStates || rentStates.length === 0) {
            return res.status(204).json({ 'message': 'No cleanStates found.' });
        }

        res.json(rentStates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error retrieving cleanStates ' });
    }
}
 

module.exports = {
    createUnit,
    updateUnit,
    getAllUnits: async (req, res) => {
        try {
            const { tuition, cleanState, rentState, category, exampleId, page, limit } = req.query;
    
            // Create a query object to hold filters
            let query = {};
    
            // Add tuition filter if provided
            if (tuition) {
                query.tuition = tuition;
            }
    
            // Add cleanState filter if provided
            if (cleanState) {
                query.cleanState = cleanState;
            }
    
            // Add rentState filter if provided
            if (rentState) {
                query.rentState = rentState;
            }
    
            // Add category filter if provided
            if (category) {
                query.categoryId = category; // Assuming category corresponds to `categoryId`
            }
    
            // Add exampleId filter if provided
            if (exampleId) {
                query.exampleId = exampleId;
            }
    
            console.log("Query", query);
    
            // Set up pagination
            const skip = page ? (Number(page) - 1) * (limit ? Number(limit) : 0) : 0; // Calculate skip only if page is provided
            const options = {
                ...(limit ? { limit: Number(limit) } : {}), // Include limit only if provided
                ...(page ? { skip } : {}) // Include skip only if page is provided
            };
    
            const rowCount = await Unit.countDocuments(query);
    
            // Retrieve units with filters and pagination
            const units = await Unit.find(query)
                .populate('exampleId') // Populate exampleId with Example data
                .populate('categoryId') // Populate categoryId with Category data
                .setOptions(options); // Using setOptions allows for dynamic application of pagination
    
            if (!units || units.length === 0) {
                return res.status(204).json({ message: 'No units found.' });
            }
    
            res.json({
                units,
                rowCount
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error retrieving units.' });
        }
    },
        
    getUnitById: async (req, res) => {
        try {
            const unit = await Unit.findById(req.params.id).populate('exampleId'); // Populate with Example data
            if (!unit) {
                return res.status(404).json({ message: 'Unit not found' });
            }
            return res.status(200).json(unit);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    deleteUnit: async (req, res) => {
        try {
            const unit = await Unit.findByIdAndDelete(req.params.id);
            if (!unit) {
                return res.status(404).json({ message: 'Unit not found' });
            }
            return res.status(200).json({ message: 'Unit deleted' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    getDistinctTuition,
    getDistinctCleanState,
    getDistinctRentState,
    findAvailableUnitByModelAndReservationTerm
};
