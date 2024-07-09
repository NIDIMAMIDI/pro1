import { Router } from 'express';
 
import userRouter from './userRoutes.js';
import tourRouter from './tourRoutes.js';
import  reviewRoutes from "./reviewRoutes.js"
const routes = Router()
routes.use('/tours', tourRouter);
routes.use('/users', userRouter);
routes.use('/reviews', reviewRoutes)

export default routes