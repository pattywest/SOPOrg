import users from '../controllers/user.controller.js';
import { Router } from 'express';

const router = Router();

const UserRoutes = (app) => {
  router.get('/', users.getAll);
  router.get('/:id', users.getById);
  router.post('/', users.create);
  router.patch('/:id', users.update);
  router.delete('/', users.deleteUser);

  app.use('/users', router);
};

export default UserRoutes;
