const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
    isBanned: { type: DataTypes.BOOLEAN, defaultValue: false },
    role: { type: DataTypes.STRING, defaultValue: 'USER' },
});

const Token = sequelize.define('token', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    refreshToken: { type: DataTypes.STRING },
});

const Post = sequelize.define('post', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    description: { type: DataTypes.STRING },
    photo: { type: DataTypes.STRING },
});

const Like = sequelize.define('like', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});

User.hasOne(Token);
Token.belongsTo(User);

User.hasMany(Post);
Post.belongsTo(User);

Post.hasMany(Like);
Like.belongsTo(Post);

User.hasMany(Like);
Like.belongsTo(User);

module.exports = {
    User,
    Token,
    Post,
    Like,
};
