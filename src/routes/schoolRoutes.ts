import { Router } from 'express';
import { createSchool, getAllSchools, getSchoolById } from '../controllers/schoolController';

const router = Router();

router.post('/schools', createSchool);
router.get('/schools', getAllSchools);
router.get('/schools/:id', getSchoolById);

export default router;
