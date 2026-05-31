import Problem from '../models/Problem.js';
import { getAIPerformanceHints, generateEdgeCases } from '../services/gemini.js';

// @desc    Analyze failed code submission and return architectural hints
// @route   POST /api/ai/debug
// @access  Private
export const getDebugHelp = async (req, res) => {
  const { problemId, userCode, language, verdict, input, expected, actual } = req.body;

  try {
    if (!problemId || !userCode || !language || !verdict) {
      return res.status(400).json({
        success: false,
        message: 'problemId, userCode, language, and verdict are required parameters',
      });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    const feedback = await getAIPerformanceHints(
      problem.title,
      problem.description,
      userCode,
      language,
      verdict,
      input || 'N/A',
      expected || 'N/A',
      actual || 'N/A'
    );

    res.status(200).json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error('AI debug controller error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate synthetic edge cases for local execution testing
// @route   POST /api/ai/edge-cases
// @access  Private
export const getGeneratedEdgeCases = async (req, res) => {
  const { problemId, userCode, language } = req.body;

  try {
    if (!problemId || !userCode || !language) {
      return res.status(400).json({
        success: false,
        message: 'problemId, userCode, and language are required parameters',
      });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    const edgeCases = await generateEdgeCases(
      problem.title,
      problem.description,
      userCode,
      language
    );

    res.status(200).json({
      success: true,
      edgeCases,
    });
  } catch (error) {
    console.error('AI edge-cases controller error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
