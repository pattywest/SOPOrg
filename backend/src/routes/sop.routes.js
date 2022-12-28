import sops from '../controllers/sop.controller.js';
import { Router } from 'express';

const router = Router();

const SOPRoutes = (app) => {
  router.get('/', sops.getAll);
  router.get('/:id', sops.getById);
  router.post('/', sops.create);
  router.patch('/:id', sops.update);
  router.get('/search/:searchTerm', sops.getAllFilteredByContent);
  router.post('/changeDirectory', sops.changeDirectory);
  router.delete('/', sops.deleteSop)

  app.use('/sops', router);
};

export default SOPRoutes;
