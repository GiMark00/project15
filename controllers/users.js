const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  NotFoundError, BadRequestError, ConflictError, UnauthorizedError,
} = require('../middlewares/error');

module.exports.getAllUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

module.exports.getSingleUser = (req, res, next) => {
  User.findById(req.params.id)
    .orFail(new Error('NotFound'))
    .then((users) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные.');
      } else if (err.message === 'NotFound') {
        throw new NotFoundError('Пользователя нет в базе.');
      }
      res.send({ data: users });
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
    .then((hash) => {
      User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      });
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.message.includes('unique')) {
        throw new ConflictError('Введённая почта уже зарегистрирована.');
      } else if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные.');
      }
    })
    .catch(next);
};

// module.exports.createUser = (req, res) => {
//   const {
//     name, about, avatar, email, password,
//   } = req.body;
//   const pattern = new RegExp(/^[A-Za-z0-9]{8,}$/);
//   if (!pattern.test(password)) {
//     return res.status(400).send({ message: 'Пароль должен состоять из заглавных и строчных букв, цифр, не содержать пробелов и быть как минимум 8 символов в длину.' });
//   }

//   bcrypt.hash(password, 10)
//     .then((hash) => User.create({
//       name,
//       about,
//       avatar,
//       email,
//       password: hash,
//     }))
//     .then((user) => res.send({ data: user }))
//     .catch((err) => {
//       if (err.message.includes('unique')) {
//         res.status(409).send({ message: 'Введённая почта уже зарегистрирована' });
//       } else if (err.name === 'ValidationError') {
//         res.status(400).send({ message: 'Переданы некорректные данные' });
//       } else {
//         res.status(500).send({ message: 'Ошибка сервера' });
//       }
//     });
// };

module.exports.login = (req, res) => {
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
        }, 'secret-key', { expiresIn: 3600 * 24 * 7 });
        return res.status(201).send({ message: `Токен: ${token}` });
      });
    })
    .catch(() => {
      throw new UnauthorizedError('Что-то пошло не так...');
    });
};
