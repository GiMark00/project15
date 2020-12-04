const PostUsers = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getAllUsers, getSingleUser,
} = require('../controllers/users');

PostUsers.get('/users', getAllUsers);
PostUsers.get('/users/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
  }),
}), getSingleUser);

module.exports = PostUsers;
