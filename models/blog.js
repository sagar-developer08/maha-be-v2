const { Model, DataTypes } = require('sequelize');
const sequelize = require('../environment/databaseConfig');

class Blog extends Model { }

Blog.init({
    title: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    content: {
        type: DataTypes.JSON, // Store content as an object with en/ar
        allowNull: false,
    },
    excerpt: {
        type: DataTypes.JSON, // Store excerpt as an object with en/ar
        allowNull: true,
    },
    date: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    written_by: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    categories: {
        type: DataTypes.JSON, // Array of category IDs
        allowNull: true,
    },
    tags: {
        type: DataTypes.JSON, // Array of tag strings
        allowNull: true,
        defaultValue: [],
    },
    status: {
        type: DataTypes.ENUM('draft', 'published', 'archived'),
        allowNull: false,
        defaultValue: 'draft',
    },
    featured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    format: {
        type: DataTypes.ENUM('standard', 'aside', 'image', 'video', 'audio', 'quote', 'link', 'gallery'),
        allowNull: false,
        defaultValue: 'standard',
    },
    seo: {
        type: DataTypes.JSON, // SEO metadata object
        allowNull: true,
        defaultValue: {
            metaTitle: { en: '', ar: '' },
            metaDescription: { en: '', ar: '' },
            slug: '',
            imageAlt: { en: '', ar: '' },
            focusKeywords: '',
            ogTitle: { en: '', ar: '' },
            ogDescription: { en: '', ar: '' }
        },
    },
}, {
    sequelize,
    modelName: 'Blog',
});

module.exports = Blog;
