const { Blog } = require('../models');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { default: axios } = require('axios');
const { Op } = require('sequelize');
require('dotenv').config(); // To use environment variables

// S3 client setup
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Helper to upload file to S3
async function uploadFileToS3(fileBuffer, fileName, fileType) {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: fileType,
        ACL: 'public-read',
    };
    await s3.send(new PutObjectCommand(params));
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
}

// Function to parse JSON fields for multilingual support
function parseJsonField(field) {
    if (!field) return { en: '', ar: '' };
    if (typeof field === 'object') return field;
    try {
        return JSON.parse(field);
    } catch {
        return { en: field, ar: '' };
    }
}

// Function to generate URL-friendly slug
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Function to ensure proper data structure for blog records
function ensureBlogDataStructure(blog) {
    return {
        ...blog.toJSON(),
        categories: blog.categories || "",
        tags: blog.tags || "",
        status: blog.status || 'draft',
        featured: blog.featured || false,
        excerpt: blog.excerpt || { en: '', ar: '' },
        seo: blog.seo || {
            metaTitle: { en: '', ar: '' },
            metaDescription: { en: '', ar: '' },
            slug: blog.slug || '',
            imageAlt: { en: '', ar: '' },
            focusKeywords: '',
            ogTitle: { en: '', ar: '' },
            ogDescription: { en: '', ar: '' }
        }
    };
}

const blogController = {
    async createBlog(req, res) {
        try {
            let imageUrl = null;
            // Check if file is present for upload
            if (req.file) {
                const fileBuffer = req.file.buffer;
                const fileName = `blogs/${Date.now()}_${req.file.originalname}`;
                const fileType = req.file.mimetype;
                imageUrl = await uploadFileToS3(fileBuffer, fileName, fileType);
            }

            // Parse JSON fields for en/ar support
            const title = parseJsonField(req.body.title);
            const content = parseJsonField(req.body.content);
            const excerpt = parseJsonField(req.body.excerpt);
            const written_by = parseJsonField(req.body.written_by);

            // Handle categories and tags
            let categories = req.body.categories || [];
            if (typeof categories === 'string') {
                categories = JSON.parse(categories);
            }

            let tags = req.body.tags || [];
            if (typeof tags === 'string') {
                tags = JSON.parse(tags);
            }

            // Handle SEO data
            let seo = req.body.seo || {};
            if (typeof seo === 'string') {
                seo = JSON.parse(seo);
            }

            // Generate slug if not provided
            let slug = req.body.slug || seo.slug;
            if (!slug && title.en) {
                slug = generateSlug(title.en);
            }

            // Ensure SEO object has proper structure
            const seoData = {
                metaTitle: parseJsonField(seo.metaTitle),
                metaDescription: parseJsonField(seo.metaDescription),
                slug: slug,
                imageAlt: parseJsonField(seo.imageAlt),
                focusKeywords: seo.focusKeywords || '',
                ogTitle: parseJsonField(seo.ogTitle),
                ogDescription: parseJsonField(seo.ogDescription)
            };

            const blog = await Blog.create({
                title,
                content,
                excerpt,
                date: req.body.date || new Date().toISOString(),
                written_by,
                slug,
                image: imageUrl || req.body.image, // fallback to image in body if no file
                categories,
                tags,
                status: req.body.status || 'draft',
                featured: req.body.featured === true || req.body.featured === 'true',
                format: req.body.format || 'standard',
                seo: seoData
            });

            res.status(201).json(ensureBlogDataStructure(blog));
        } catch (error) {
            console.error('Create blog error:', error);
            res.status(400).json({ error: error.message });
        }
    },

    async getAllBlogs(req, res) {
        try {
            const blogs = await Blog.findAll({
                order: [['createdAt', 'DESC']]
            });

            // Ensure proper data structure for all blogs
            const formattedBlogs = blogs.map(blog => ensureBlogDataStructure(blog));

            res.status(200).json(formattedBlogs);
        } catch (error) {
            console.error('Get all blogs error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    async getPublishedBlogs(req, res) {
        try {
            const blogs = await Blog.findAll({
                where: { status: 'published' },
                order: [['createdAt', 'DESC']]
            });

            const formattedBlogs = blogs.map(blog => ensureBlogDataStructure(blog));
            res.status(200).json(formattedBlogs);
        } catch (error) {
            console.error('Get published blogs error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    async getBlogsByStatus(req, res) {
        try {
            const { status } = req.params;
            const validStatuses = ['draft', 'published', 'archived'];

            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: 'Invalid status. Must be: draft, published, or archived' });
            }

            const blogs = await Blog.findAll({
                where: { status },
                order: [['createdAt', 'DESC']]
            });

            const formattedBlogs = blogs.map(blog => ensureBlogDataStructure(blog));
            res.status(200).json(formattedBlogs);
        } catch (error) {
            console.error('Get blogs by status error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    async getBlogsByCategory(req, res) {
        try {
            const { categoryId } = req.params;
            const categoryIdInt = parseInt(categoryId);

            if (isNaN(categoryIdInt)) {
                return res.status(400).json({ error: 'Invalid category ID' });
            }

            const blogs = await Blog.findAll({
                where: {
                    categories: {
                        [Op.contains]: [categoryIdInt]
                    }
                },
                order: [['createdAt', 'DESC']]
            });

            const formattedBlogs = blogs.map(blog => ensureBlogDataStructure(blog));
            res.status(200).json(formattedBlogs);
        } catch (error) {
            console.error('Get blogs by category error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    async getBlogById(req, res) {
        try {
            const blog = await Blog.findByPk(req.params.id);
            if (!blog) return res.status(404).json({ error: 'Blog not found' });

            res.status(200).json(ensureBlogDataStructure(blog));
        } catch (error) {
            console.error('Get blog by ID error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    async getBlogBySlug(req, res) {
        try {
            const { slug } = req.params;
            // Find the main blog by slug
            const blog = await Blog.findOne({
                where: { slug }
            });
            if (!blog) return res.status(404).json({ error: 'Blog not found' });

            // Get 10 random blogs excluding the current one
            // Use correct random ordering for MySQL and SQLite/Postgres
            const randomOrder = Blog.sequelize.getDialect() === 'mysql' ? Blog.sequelize.literal('RAND()') : Blog.sequelize.literal('RANDOM()');
            const relatedBlogs = await Blog.findAll({
                where: {
                    id: { [Op.ne]: blog.id },
                    status: 'published' // Only get published blogs for related
                },
                order: [randomOrder],
                limit: 10
            });

            const formattedRelatedBlogs = relatedBlogs.map(blog => ensureBlogDataStructure(blog));

            res.status(200).json({
                blog: ensureBlogDataStructure(blog),
                relatedBlogs: formattedRelatedBlogs
            });
        } catch (error) {
            console.error('Get blog by slug error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    async updateBlog(req, res) {
        try {
            const blog = await Blog.findByPk(req.params.id);
            if (!blog) return res.status(404).json({ error: 'Blog not found' });

            let imageUrl = blog.image;
            // If a new file is uploaded, upload to S3
            if (req.file) {
                const fileBuffer = req.file.buffer;
                const fileName = `blogs/${Date.now()}_${req.file.originalname}`;
                const fileType = req.file.mimetype;
                imageUrl = await uploadFileToS3(fileBuffer, fileName, fileType);
            }

            // Parse JSON fields for en/ar support
            const title = parseJsonField(req.body.title);
            const content = parseJsonField(req.body.content);
            const excerpt = parseJsonField(req.body.excerpt);
            const written_by = parseJsonField(req.body.written_by);

            // Handle categories and tags
            let categories = req.body.categories || blog.categories;
            if (typeof categories === 'string') {
                categories = JSON.parse(categories);
            }

            let tags = req.body.tags || blog.tags;
            if (typeof tags === 'string') {
                tags = JSON.parse(tags);
            }

            // Handle SEO data
            let seo = req.body.seo || blog.seo;
            if (typeof seo === 'string') {
                seo = JSON.parse(seo);
            }

            // Generate slug if not provided
            let slug = req.body.slug || seo.slug || blog.slug;
            if (!slug && title.en) {
                slug = generateSlug(title.en);
            }

            // Ensure SEO object has proper structure
            const seoData = {
                metaTitle: parseJsonField(seo.metaTitle),
                metaDescription: parseJsonField(seo.metaDescription),
                slug: slug,
                imageAlt: parseJsonField(seo.imageAlt),
                focusKeywords: seo.focusKeywords || '',
                ogTitle: parseJsonField(seo.ogTitle),
                ogDescription: parseJsonField(seo.ogDescription)
            };

            await blog.update({
                title,
                content,
                excerpt,
                date: req.body.date || blog.date,
                written_by,
                slug,
                image: imageUrl || req.body.image, // fallback to image in body if no file
                categories,
                tags,
                status: req.body.status || blog.status,
                featured: req.body.featured !== undefined ? (req.body.featured === true || req.body.featured === 'true') : blog.featured,
                format: req.body.format || blog.format || 'standard',
                seo: seoData
            });

            res.status(200).json(ensureBlogDataStructure(blog));
        } catch (error) {
            console.error('Update blog error:', error);
            res.status(400).json({ error: error.message });
        }
    },

    async deleteBlog(req, res) {
        try {
            const blog = await Blog.findByPk(req.params.id);
            if (!blog) return res.status(404).json({ error: 'Blog not found' });
            await blog.destroy();
            res.status(204).send();
        } catch (error) {
            console.error('Delete blog error:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = blogController;
