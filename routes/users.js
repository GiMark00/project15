const PostUsers = require('express').Router();
const { celebrate } = require('celebrate');
const {
  getAllUsers, getSingleUser,
} = require('../controllers/users');

PostUsers.get('/users', getAllUsers);
PostUsers.get('/users/:id', celebrate({
  params: { id: /\w+/ },
}), getSingleUser);

// path: /users\/\w+/,

module.exports = PostUsers;
