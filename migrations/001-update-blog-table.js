'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Check if the table exists and get its structure
      const tableDescription = await queryInterface.describeTable('Blogs');
      
      // Add new columns if they don't exist
      if (!tableDescription.excerpt) {
        await queryInterface.addColumn('Blogs', 'excerpt', {
          type: Sequelize.JSON,
          allowNull: true,
        }, { transaction });
      }
      
      if (!tableDescription.categories) {
        await queryInterface.addColumn('Blogs', 'categories', {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: [],
        }, { transaction });
      }
      
      if (!tableDescription.tags) {
        await queryInterface.addColumn('Blogs', 'tags', {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: [],
        }, { transaction });
      }
      
      if (!tableDescription.status) {
        await queryInterface.addColumn('Blogs', 'status', {
          type: Sequelize.ENUM('draft', 'published', 'archived'),
          allowNull: false,
          defaultValue: 'draft',
        }, { transaction });
      }
      
      if (!tableDescription.featured) {
        await queryInterface.addColumn('Blogs', 'featured', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        }, { transaction });
      }
      
      if (!tableDescription.seo) {
        await queryInterface.addColumn('Blogs', 'seo', {
          type: Sequelize.JSON,
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
        }, { transaction });
      }
      
      // Rename 'body' column to 'content' if it exists
      if (tableDescription.body && !tableDescription.content) {
        await queryInterface.renameColumn('Blogs', 'body', 'content', { transaction });
      }
      
      // Add unique constraint to slug if it doesn't exist
      try {
        await queryInterface.addConstraint('Blogs', {
          fields: ['slug'],
          type: 'unique',
          name: 'blogs_slug_unique'
        }, { transaction });
      } catch (error) {
        // Constraint might already exist, ignore error
        console.log('Slug unique constraint might already exist:', error.message);
      }
      
      await transaction.commit();
      console.log('Blog table updated successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('Error updating blog table:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove added columns
      await queryInterface.removeColumn('Blogs', 'excerpt', { transaction });
      await queryInterface.removeColumn('Blogs', 'categories', { transaction });
      await queryInterface.removeColumn('Blogs', 'tags', { transaction });
      await queryInterface.removeColumn('Blogs', 'status', { transaction });
      await queryInterface.removeColumn('Blogs', 'featured', { transaction });
      await queryInterface.removeColumn('Blogs', 'seo', { transaction });
      
      // Rename 'content' back to 'body'
      await queryInterface.renameColumn('Blogs', 'content', 'body', { transaction });
      
      // Remove unique constraint from slug
      await queryInterface.removeConstraint('Blogs', 'blogs_slug_unique', { transaction });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}; 