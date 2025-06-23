const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Create a category
router.post('/category', categoryController.createCategory);

// Get all categories
router.get('/category', categoryController.getAllCategories);

// Search categories
router.get('/category/search', categoryController.searchCategories);

// Get a category by ID
router.get('/category/:id', categoryController.getCategoryById);

// Get a category by slug
router.get('/category/slug/:slug', categoryController.getCategoryBySlug);

// Update a category by ID
router.put('/category/:id', categoryController.updateCategory);

// Delete a category by ID
router.delete('/category/:id', categoryController.deleteCategory);

module.exports = router; 