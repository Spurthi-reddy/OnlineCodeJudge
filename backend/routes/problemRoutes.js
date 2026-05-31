import express from 'express';
import {
  getProblems,
  getProblemByIdOrSlug,
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemCategories,
} from '../controllers/problemController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProblems)
  .post(protect, adminOnly, createProblem);

router.get('/tags', getProblemCategories);

router.route('/:identifier')
  .get(getProblemByIdOrSlug);

router.route('/:id')
  .put(protect, adminOnly, updateProblem)
  .delete(protect, adminOnly, deleteProblem);

export default router;
