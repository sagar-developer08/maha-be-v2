const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// Create a blog
router.post('/blog', blogController.createBlog);

// Get all blogs
router.get('/blog', blogController.getAllBlogs);

// Get published blogs (for public frontend)
router.get('/blog/published', blogController.getPublishedBlogs);

// Get blogs by status
router.get('/blog/status/:status', blogController.getBlogsByStatus);

// Get blogs by category
router.get('/blog/category/:categoryId', blogController.getBlogsByCategory);

// Get a blog by ID
router.get('/blog/:id', blogController.getBlogById);

// Get a blog by slug
router.get('/blog/slug/:slug', blogController.getBlogBySlug);

// Update a blog by ID
router.put('/blog/:id', blogController.updateBlog);

// Delete a blog by ID
router.delete('/blog/:id', blogController.deleteBlog);

module.exports = router;
