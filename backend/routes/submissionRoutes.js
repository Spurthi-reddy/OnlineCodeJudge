import express from 'express';
import {
  runCode,
  submitCode,
  getSubmissionHistory,
  getLeaderboard,
  getProblemPerformanceCurve,
} from '../controllers/submissionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Apply JWT protection to all submission routes

router.post('/run', runCode);
router.post('/submit', submitCode);
router.get('/', getSubmissionHistory);
router.get('/leaderboard', getLeaderboard);
router.get('/performance/:problemId', getProblemPerformanceCurve);

export default router;
