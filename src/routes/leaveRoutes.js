import express from 'express';
import { applyLeave, getMyLeaves } from '../controllers/leaveController.js';
import upload from '../middleware/multer.js';
import userAuth from '../middleware/userAuth.js';

const leaveRouter = express.Router();


leaveRouter.post('/apply', userAuth, upload.array('documents', 5), applyLeave);
leaveRouter.get('/list', userAuth, getMyLeaves);

export default leaveRouter;