const Card = require('../models/card');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../middlewares/error');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      if (!cards.length) {
        throw new NotFoundError('В базе нет карточек.');
      }
      res.send({ data: cards });
    })
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((cards) => {
      res.send({ data: cards });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные.');
      }
      next(err);
    })
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  const currentUserId = req.user._id;
  Card.findById(req.params.id)
    .orFail(new Error('notValidId'))
    .then((card) => {
      const owner = card.owner._id.toString();
      if (!card._id) {
        throw new NotFoundError('Карточки нет в базе.');
      } else if (currentUserId !== owner) {
        throw new ForbiddenError('Нельзя удалить чужую карточку.');
      } else {
        Card.deleteOne(card)
          .then(() => {
            res.send({ data: card });
          });
      }
    })
    .catch(next);
};
