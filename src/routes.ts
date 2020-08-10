import express from 'express';
import ClassesController from './controllers/classes/ClassesController';
import ConnectionsController from './controllers/connections/ConnectionsController';

const routes = express.Router();

const classesController = new ClassesController();
const connecttionsController = new ConnectionsController();

// Métodos da parte de classes
routes.get('/classes', classesController.index);
routes.post('/classes', classesController.create);

// Métodos da parte de conexões
routes.get('/connections', connecttionsController.index);
routes.post('/connections', connecttionsController.create);

export default routes;