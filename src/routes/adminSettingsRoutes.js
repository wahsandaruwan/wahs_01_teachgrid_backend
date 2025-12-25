import express from 'express';
import { 
    getAllTeachers, 
    updateTeacher, 
    deleteTeacher, 
    updateTeacherPassword,
    getAdminProfile,
    updateAdminProfile 
} from '../controllers/adminSettingsController.js';
import userAuth from '../middleware/userAuth.js';

const router = express.Router();

// Admin Profile Routes 
router.get('/data', userAuth, getAdminProfile); 
router.patch('/update', userAuth, updateAdminProfile);

//  Teacher Management Routes 
router.get('/teachers', userAuth, getAllTeachers);

// To update teacher details (and Password) and send an email
router.patch('/teachers/:id', userAuth, updateTeacher); 

// To delete a teacher
router.delete('/teachers/:id', userAuth, deleteTeacher);


router.patch('/teachers/password/:id', userAuth, updateTeacherPassword);

export default router;