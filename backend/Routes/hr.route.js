import express from 'express';
import { createNewForm } from '../controllers/hr.controller.js';
import { getForm } from '../controllers/hr.controller.js';
import { getallforms } from '../controllers/hr.controller.js';

const router = express.Router();

router.post('/hr', createNewForm);
router.post('/hr/list', getForm);
router.post('/hr/all', getallforms);

export default router;