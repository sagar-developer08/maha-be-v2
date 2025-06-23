const { Category } = require('../models');
const { Op } = require('sequelize');

// Function to generate URL-friendly slug
function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Function to parse categories from stringified JSON
function parseCategories(categoriesData) {
    if (typeof categoriesData === 'string') {
        try {
            return JSON.parse(categoriesData);
        } catch (error) {
            throw new Error('Invalid categories format');
        }
    }
    return Array.isArray(categoriesData) ? categoriesData : [categoriesData];
}

const categoryController = {
    async createCategory(req, res) {
        try {
            const { name, slug, categories } = req.body;
            
            // Handle both single category and multiple categories from stringified JSON
            if (categories) {
                // Parse the stringified JSON array
                const parsedCategories = parseCategories(categories);
                const createdCategories = [];
                
                for (const categoryData of parsedCategories) {
                    const categoryName = categoryData.name;
                    
                    // Generate slug from English name
                    const categorySlug = generateSlug(categoryName.en);
                    
                    // Check if category with this slug already exists
                    const existingCategory = await Category.findOne({ where: { slug: categorySlug } });
                    if (existingCategory) {
                        continue; // Skip if already exists
                    }
                    
                    const category = await Category.create({
                        name: categoryName,
                        slug: categorySlug
                    });
                    
                    createdCategories.push(category);
                }
                
                return res.status(201).json(createdCategories);
            } else {
                // Handle single category creation
                let finalSlug = slug;
                if (!finalSlug && name && name.en) {
                    finalSlug = generateSlug(name.en);
                }
                
                const category = await Category.create({
                    name,
                    slug: finalSlug
                });

                return res.status(201).json(category);
            }
        } catch (error) {
            console.error('Create category error:', error);
            res.status(400).json({ error: error.message });
        }
    },

    async getAllCategories(req, res) {
        try {
            const categories = await Category.findAll({
                order: [['createdAt', 'DESC']]
            });

            res.status(200).json(categories);
        } catch (error) {
            console.error('Get all categories error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    async getCategoryById(req, res) {
        try {
            const { id } = req.params;
            const category = await Category.findByPk(id);

            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            res.status(200).json(category);
        } catch (error) {
            console.error('Get category by ID error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    async getCategoryBySlug(req, res) {
        try {
            const { slug } = req.params;
            const category = await Category.findOne({ where: { slug } });

            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            res.status(200).json(category);
        } catch (error) {
            console.error('Get category by slug error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const { name, slug } = req.body;
            
            const category = await Category.findByPk(id);

            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            // Generate slug from English name if name is updated but slug is not provided
            let finalSlug = slug || category.slug;
            if (name && name.en && !slug) {
                finalSlug = generateSlug(name.en);
            }

            const updatedCategory = await category.update({
                name: name || category.name,
                slug: finalSlug
            });

            res.status(200).json(updatedCategory);
        } catch (error) {
            console.error('Update category error:', error);
            res.status(400).json({ error: error.message });
        }
    },

    async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            const category = await Category.findByPk(id);

            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            await category.destroy();
            res.status(200).json({ message: 'Category deleted successfully' });
        } catch (error) {
            console.error('Delete category error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    async searchCategories(req, res) {
        try {
            const { q } = req.query;
            
            if (!q) {
                return res.status(400).json({ error: 'Search query is required' });
            }

            const searchConditions = {
                [Op.or]: [
                    {
                        name: {
                            [Op.like]: `%${q.toLowerCase()}%`
                        }
                    }
                ]
            };

            const categories = await Category.findAll({
                where: searchConditions,
                order: [['createdAt', 'DESC']]
            });

            res.status(200).json(categories);
        } catch (error) {
            console.error('Search categories error:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = categoryController; 