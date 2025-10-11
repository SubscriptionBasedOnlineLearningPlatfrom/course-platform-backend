import express from 'express';
import { addModule, listModules, deleteModule } from '../../controllers/instructor/moduleController.js';
import { auth } from '../../middlewares/authMiddleware.js';

const router = express.Router();

//add a new module 
router.post('/:courseId', auth, addModule);

//get all modules 
router.get('/:courseId', auth, listModules);

//delete module
router.delete('/:moduleId', auth, deleteModule);


export default router;
