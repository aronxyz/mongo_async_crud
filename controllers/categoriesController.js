const Category = require('../model/Category');

// Get all categories
const getAllCategories = async (req, res) => {
    const categories = await Category.find();
    if (!categories || categories.length === 0) return res.status(204).json({ 'message': 'No categories found.' });
    res.json(categories);
}

// Create a new category
const createNewCategory = async (req, res) => {
    if (!req?.body?.title) {
        return res.status(400).json({ 'message': 'Title is required' });
    }

    try {
        const result = await Category.create({
            title: req.body.title
        });

        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error creating category' });
    }
}

// Update an existing category
const updateCategory = async (req, res) => {
    if (!req?.body?.id) {
        return res.status(400).json({ 'message': 'ID parameter is required.' });
    }

    const category = await Category.findOne({ _id: req.body.id }).exec();
    if (!category) {
        return res.status(204).json({ "message": `No category matches ID ${req.body.id}.` });
    }
    if (req.body?.title) category.title = req.body.title;

    try {
        const result = await category.save();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error updating category' });
    }
}

// Delete a category
const deleteCategory = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'Category ID required.' });

    const category = await Category.findOne({ _id: req.body.id }).exec();
    if (!category) {
        return res.status(204).json({ "message": `No category matches ID ${req.body.id}.` });
    }

    try {
        const result = await category.deleteOne();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Error deleting category' });
    }
}

// Get a single category by ID
const getCategory = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ 'message': 'Category ID required.' });

    const category = await Category.findOne({ _id: req.params.id }).exec();
    if (!category) {
        return res.status(204).json({ "message": `No category matches ID ${req.params.id}.` });
    }

    res.json(category);
}

module.exports = {
    getAllCategories,
    createNewCategory,
    updateCategory,
    deleteCategory,
    getCategory
}
