import auth from '../controllers/auth.controller.js';
import { Router } from 'express';
import jwt from '../middleware/auth.Jwt.js';

const router = Router();

const AuthRoutes = (app) => {
  router.post('/signin', auth.signin);

  router.post('/signout', auth.signout);

  router.post('/preregister', auth.preregister);

  router.post('/register', auth.register);

  router.post('/perms', jwt.verifyToken, jwt.isAdmin, auth.changePermission);

  router.delete('/removefile', jwt.verifyToken, jwt.isAdmin, auth.removeFile);

  app.use('/auth', router);
};
export default AuthRoutes;
