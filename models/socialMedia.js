const { Model, DataTypes } = require('sequelize');
const sequelize = require('../environment/databaseConfig');

class SocialMedia extends Model {}

SocialMedia.init({
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',  // Assuming the Users table exists
      key: 'id'
    }
  },
  instagram_id: DataTypes.STRING,
  tiktok_id: DataTypes.STRING,
  youtube_channel: DataTypes.STRING,
  snapchat_id: DataTypes.STRING,
  linkedin_id: DataTypes.STRING,
  weibo_id: DataTypes.STRING,
  wechat_id: DataTypes.STRING,
  douyin_id: DataTypes.STRING,
  zhihu_id: DataTypes.STRING,
  tencent_id: DataTypes.STRING,
  kuaishou_id: DataTypes.STRING,
  youku_id: DataTypes.STRING,
  xiaohongshu_id: DataTypes.STRING,
  douban_id: DataTypes.STRING,
  vkontakte_id: DataTypes.STRING,
  telegram_id: DataTypes.STRING,
  twitter_id: DataTypes.STRING,
  rutube_id: DataTypes.STRING,
  livejournal_id: DataTypes.STRING,
  odnoklassniki_id: DataTypes.STRING,
  my_world_mail_ru: DataTypes.STRING
}, {
  sequelize,
  modelName: 'SocialMedia'
});

module.exports = SocialMedia;
