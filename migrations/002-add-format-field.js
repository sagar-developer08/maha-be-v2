'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the format column already exists
      const tableDescription = await queryInterface.describeTable('Blogs');
      
      if (!tableDescription.format) {
        await queryInterface.addColumn('Blogs', 'format', {
          type: Sequelize.ENUM('standard', 'aside', 'image', 'video', 'audio', 'quote', 'link', 'gallery'),
          allowNull: false,
          defaultValue: 'standard',
        });
        console.log('Format column added successfully');
      } else {
        console.log('Format column already exists');
      }
    } catch (error) {
      console.error('Error adding format column:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('Blogs', 'format');
    } catch (error) {
      console.error('Error removing format column:', error);
      throw error;
    }
  }
}; 