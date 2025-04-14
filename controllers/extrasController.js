const Extra = require('../model/Extra');

// Get all extras (add-ons)
const getAllExtras = async (req, res) => {
    try {
        const extras = await Extra.find();
        if (!extras || extras.length === 0) {
            return res.status(204).json({ message: 'No extras found.' });
        }
        res.json(extras);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving extras.' });
    }
};

// Create a new extra (add-on)
const createNewExtra = async (req, res) => {
    const { type, icon, title, description, deductible, fee, action } = req.body;

    if (!type || !icon || !title || !description || !action) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const newExtra = new Extra({
            type,
            icon,
            title,
            description,
            deductible,
            fee,
            action
        });

        await newExtra.save();
        res.status(201).json(newExtra);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating the extra.' });
    }
};

// Update an existing extra (add-on)
const updateExtra = async (req, res) => {
    const { id, type, icon, title, description, deductible, fee, action } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Extra ID is required.' });
    }

    try {
        const updatedExtra = await Extra.findByIdAndUpdate(
            id,
            { type, icon, title, description, deductible, fee, action },
            { new: true }
        );

        if (!updatedExtra) {
            return res.status(404).json({ message: `No extra found with ID ${id}.` });
        }

        res.json(updatedExtra);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating the extra.' });
    }
};

// Delete an extra (add-on)
const deleteExtra = async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Extra ID is required.' });
    }

    try {
        const deletedExtra = await Extra.findByIdAndDelete(id);

        if (!deletedExtra) {
            return res.status(404).json({ message: `No extra found with ID ${id}.` });
        }

        res.json({ message: 'Extra deleted.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting the extra.' });
    }
};

// Get extra (add-on) by ID
const getExtraById = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'Extra ID is required.' });
    }

    try {
        const extra = await Extra.findById(id);

        if (!extra) {
            return res.status(404).json({ message: `No extra found with ID ${id}.` });
        }

        res.json(extra);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving the extra.' });
    }
};

module.exports = {
    getAllExtras,
    createNewExtra,
    updateExtra,
    deleteExtra,
    getExtraById
};
