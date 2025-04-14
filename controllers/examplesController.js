const Example = require('../model/Example'); // Changed from Car to Example
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'assets/'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        const customFileName = req.body.fileName || `default-name-${Date.now()}`;
        cb(null, `${customFileName}${Date.now()}${path.extname(file.originalname)}`);
    }
});

const uploadSingleImage = multer({ storage }).single('image');

// Middleware function to set the image URL on req
const uploadMiddlewareWithUrl = (req, res, next) => {
    uploadSingleImage(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(500).send({ message: err.message });
        }

        if (req.file) {
            // Construct the image URL and attach it to the req object
            req.imageUrl = `/assets/${req.file.filename}`;
        } else {
            req.imageUrl = null; // No image uploaded
        }

        next(); // Proceed to the next middleware/controller
    });
};

const getAllExamples = async (req, res) => {
    try {
        const { price_min, price_max, category, model, page, limit } = req.query;

        // Create a query object to hold filters
        let query = {};

        // Add price range to query if provided
        if (price_min) {
            query.price = { ...query.price, $gte: Number(price_min) }; // Greater than or equal to price_min
        }
        if (price_max) {
            query.price = { ...query.price, $lte: Number(price_max) }; // Less than or equal to price_max
        }

        // Add category filter if provided
        if (category) {
            query.category = category;
        }

        // Add model filter if provided
        if (model) {
            query.model = model;
        }

        console.log("Query", query);

        // Set up pagination
        const skip = page ? (Number(page) - 1) * (limit ? Number(limit) : 0) : 0; // Calculate skip only if page is provided
        const options = {
            ...(limit ? { limit: Number(limit) } : {}), // Include limit only if provided
            ...(page ? { skip } : {}) // Include skip only if page is provided
        };

        const rowCount = await Example.countDocuments(query);

        // Retrieve examples with filters and pagination
        const examples = await Example.find(query)
            .populate('category')
            .setOptions(options); // Using setOptions allows for dynamic application of pagination

        if (!examples || examples.length === 0) {
            return res.status(204).json({ message: 'No examples found.' });
        }

        res.json({
            examples,
            rowCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving examples.' });
    }
};

const createNewExample = async (req, res) => {
    const { model, category, seats, doors, price } = req.body;

    // Handle any errors in the uploaded image in the middleware
    if (!model || !category || seats == null || doors == null || price == null) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Use the image URL set by the middleware
        const assetUrl = req.imageUrl || null; // Set to null if no image was uploaded

        const newExample = new Example({
            model,
            category,
            seats,
            doors,
            price,
            image: assetUrl // Store the URL in the database
        });

        await newExample.save();
        res.status(201).json(newExample);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating the example.' });
    }
};

const updateExample = async (req, res) => {
    const { _id, model, category, seats, doors, price } = req.body;

    if (!_id) {
        return res.status(400).json({ message: 'Example ID is required.' });
    }

    try {
        // Find the existing example
        const existingExample = await Example.findById(_id);
        if (!existingExample) {
            return res.status(404).json({ message: `No example found with ID ${_id}.` });
        }

        // Check if a new image is uploaded
        let image = existingExample.image; // Default to existing image
        if (req.imageUrl) {
            // Delete old image from assets directory if it exists
            if (existingExample.image) {
                const oldImagePath = path.join(__dirname, '..', existingExample.image);
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error('Error deleting old image:', err);
                });
            }
            image = req.imageUrl; // Update to use the multer-generated filename URL
        }

        // Update the example in the database
        const updatedExample = await Example.findByIdAndUpdate(
            _id,
            { category, model, doors, price, seats, image },
            { new: true } // Return the updated document
        );

        res.json(updatedExample);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating the example.' });
    }
};

const deleteExample = async (req, res) => {
    const { id } = req.body;
    
    if (!id) {
        return res.status(400).json({ message: 'Example ID is required.' });
    }

    try {
        // Find the example to delete
        const exampleToDelete = await Example.findById(id);
        if (!exampleToDelete) {
            return res.status(404).json({ message: `No example found with ID ${id}.` });
        }

        // Delete image from assets directory if it exists
        if (exampleToDelete.image) {
            const imagePath = path.join(__dirname, '..', exampleToDelete.image);
            fs.unlink(imagePath, (err) => {
                if (err) console.error('Error deleting image:', err);
            });
        }

        // Delete the example from the database
        await Example.findByIdAndDelete(id);

        res.json({ message: 'Example deleted.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting the example.' });
    }
};

// Get example by ID
const getExampleById = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'Example ID is required.' });
    }

    try {
        const example = await Example.findById(id).populate('category');

        if (!example) {
            return res.status(404).json({ message: `No example found with ID ${id}.` });
        }

        res.json(example);
    } catch (err) {
        console.error("Detailed error:", err); // This will log the exact error
        res.status(500).json({ message: 'Error retrieving the example.', error: err.message });
    }
};

// Get example prices
const getExamplePrices = async (req, res) => {
    try {
        // Retrieve distinct example prices from the database
        const prices = await Example.distinct('price');

        if (!prices || prices.length === 0) {
            return res.status(204).json({ 'message': 'No prices found.' });
        }

        res.json(prices);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error retrieving prices.' });
    }
};

const getExampleModels = async (req, res) => {
    try {
        // Retrieve distinct example models from the database
        const models = await Example.distinct('model');

        if (!models || models.length === 0) {
            return res.status(204).json({ 'message': 'No models found.' });
        }

        // Respond with the distinct models
        res.json(models);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error retrieving models.' });
    }
};


module.exports = {
    uploadMiddlewareWithUrl,
    getAllExamples, // Changed from getAllCars to getAllExamples
    createNewExample, // Changed from createNewCar to createNewExample
    updateExample, // Changed from updateCar to updateExample
    deleteExample, // Changed from deleteCar to deleteExample
    getExampleById, // Changed from getCarById to getExampleById
    getExamplePrices,
    getExampleModels // Changed from getCarPrices to getExamplePrices
};
