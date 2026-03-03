import { Router } from 'express';
import { createStudent, getAllStudents, getStudentByCedula } from '../controllers/studentController';

const router = Router();

router.post('/students', createStudent);
router.get('/students', getAllStudents);
router.get('/students/cedula/:cedula', getStudentByCedula);

export default router;
