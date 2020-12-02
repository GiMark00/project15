const Card = require('../models/card');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../middlewares/error');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link, owner } = req.body;

  Card.create({ name, link, owner })
    .then((cards) => {
      if (cards.name === 'ValidationError') {
        throw new BadRequestError.Send('Карточки нет в базе.');
      }
      res.send({ data: cards });
    })
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  const currentUserId = req.user._id;
  Card.findById(req.params.id)
    .orFail(new Error('notValidId'))
    .orFail()
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
