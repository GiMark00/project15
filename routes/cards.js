const PostCards = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getCards, createCard, deleteCard } = require('../controllers/cards');

PostCards.get('/cards', getCards);
PostCards.post('/cards', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required(),
    owner: Joi.string().required(),
  }),
}), createCard);
PostCards.delete('/cards/:id', deleteCard);

module.exports = PostCards;
