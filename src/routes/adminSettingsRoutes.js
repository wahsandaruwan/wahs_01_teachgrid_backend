import express from 'express';
import { 
    getAllTeachers, 
    updateTeacher, 
    deleteTeacher, 
    updateTeacherPassword,
    getAdminProfile,
    updateAdminProfile 
} from '../controllers/adminSettingsController.js';
import userAuth, { isAdmin } from '../middleware/userAuth.js'; 
const router = express.Router();

// Admin Profile Routes 
router.get('/data', userAuth, isAdmin, getAdminProfile); 
router.patch('/update', userAuth, isAdmin, updateAdminProfile);

// Teacher Management Routes 
router.get('/teachers', userAuth, isAdmin, getAllTeachers);

// To update teacher details (and Password) and send an email
router.patch('/teachers/:id', userAuth, isAdmin, updateTeacher); 

// To delete a teacher
router.delete('/teachers/:id', userAuth, isAdmin, deleteTeacher);

// To update password specifically
router.patch('/teachers/password/:id', userAuth, isAdmin, updateTeacherPassword);

export default router;
