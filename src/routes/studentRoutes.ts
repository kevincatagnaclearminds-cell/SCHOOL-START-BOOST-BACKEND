import { Router } from 'express';
import { createStudent, getAllStudents, getStudentByCedula, completeTraining, updateStudentByCedula } from '../controllers/studentController';
import { validateRequest } from '../middleware/validateRequest';
import { createStudentSchema, completeTrainingSchema, updateStudentSchema } from '../schemas/studentSchema';

const router = Router();

router.post('/students', validateRequest(createStudentSchema), createStudent);
router.get('/students', getAllStudents);
router.get('/students/cedula/:cedula', getStudentByCedula);
router.put('/students/cedula/:cedula', validateRequest(updateStudentSchema), updateStudentByCedula);
router.post('/students/:id/complete-training', validateRequest(completeTrainingSchema), completeTraining);

export default router;
