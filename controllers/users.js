const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  NotFoundError, ConflictError, UnauthorizedError, BadRequestError,
} = require('../middlewares/error');

const { NODE_ENV, JWT_SECRET = 'super-secret-key' } = process.env;

module.exports.getAllUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      if (!users.length) {
        throw new NotFoundError('В базе нет пользователей.');
      }
      res.send({ data: users });
    })
    .catch(next);
};

module.exports.getSingleUser = (req, res, next) => {
  User.findById(req.params.id)
    .orFail(new Error('NotFound'))
    .then((users) => {
      res.send({ data: users });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные.');
      } else if (err.message === 'NotFound') {
        throw new NotFoundError('Пользователя нет в базе.');
      }
      next(err);
    })
    .catch(next);
};

// eslint-disable-next-line consistent-return
module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  const pattern = new RegExp(/^[A-Za-z0-9]{8,}$/);
  if (!pattern.test(password)) {
    throw new BadRequestError('Пароль должен состоять из заглавных и строчных букв, цифр, не содержать пробелов и быть как минимум 8 символов в длину.');
  }

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => res.status(201).send({
      data: {
        id: user.id, name: user.name, about: user.about, avatar: user.avatar, email: user.email,
      },
    }))

    .catch((err) => {
      if (err.message.includes('unique')) {
        throw new ConflictError('Введённая почта уже зарегистрирована.');
      } else if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные.');
      }
      next(err);
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('password')
    // eslint-disable-next-line consistent-return
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неправильно введена почта.');
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new UnauthorizedError('Неправильно введён пароль.');
        }
        const token = jwt.sign({
          _id: user._id,
        }, NODE_ENV === 'production' ? JWT_SECRET : 'super-secret-key', { expiresIn: 3600 * 24 * 7 });
        return res.status(201).send({ message: `Токен: ${token}` });
      });
    })
    .catch(next);
};
