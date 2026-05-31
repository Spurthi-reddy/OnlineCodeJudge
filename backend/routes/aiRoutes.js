import express from 'express';
import { getDebugHelp, getGeneratedEdgeCases } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure all AI endpoints

router.post('/debug', getDebugHelp);
router.post('/edge-cases', getGeneratedEdgeCases);

export default router;
