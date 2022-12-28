import User from '../models/user.model.js';

const create = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: 'No User found in request body.' });
    return;
  }

  const newUser = new User(req.body);

  User.create(newUser, (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(409).send({ message: 'Error: Duplicate User detected.' });
      } else {
        res.status(500).send({
          message: 'An error occurred while creating the User.',
        });
      }
    } else {
      res.sendStatus(201);
    }
  });
};

const update = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: 'No User found in request body.' });
    return;
  }

  const updatedUser = new User(req.body);

  User.update(req.params.id, updatedUser, (err) => {
    if (err) {
      res.status(500).send({
        message: 'An error occurred while updating the User.',
      });
    } else {
      res.sendStatus(201);
    }
  });
};

// TODO - consider making this admin only feature or removing
const getAll = (req, res) => {
  User.getAll((err, data) => {
    if (err) {
      res.status(500).send({
        message: 'An error occurred while fetching users.',
      });
    } else {
      res.send(data);
    }
  });
};

const getById = (req, res) => {
  User.getById(req.params.id, (err, user) => {
    if (err) {
      res.status(500).send({
        message: 'An error occurred while fetching the user.',
      });
      return;
    }
    res.send(user);
  });
};

const deleteUser = (req, res) => {
  User.deleteUser(req.body.email, (err, user) => {
    if (err) {
      res.status(500).send({
        message: 'An error occurred while deleting the user.',
      });
      return;
    }
    res.send(user);
  });
};

export default { create, getAll, getById, update, deleteUser };
